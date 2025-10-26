import { INDIVIDUAL, NAME } from '../gedcom/constants.js';
import { createObject, schema, foaf, bio, rdfs, dc, skos } from './context.js';
import { addPhonetisation, addRomanisation } from './text/index.js';
import { mapObject, noop } from './utils.js';
import { converter as dateConverter } from './date.js';
import event from './event.js';

/**
 * Gender types
 * @const GENDER_TYPES
 * @type {Object}
 * @private
 */

const GENDER_TYPES = {
	M: `${schema.URI}/Male`,
	F: `${schema.URI}/Female`,
	X: 'Intersex',
	N: 'Not recorded',
};

/**
 * Name parsing regular expression
 * @const NAME_RE
 * @type {RegExp}
 * @private
 */

const NAME_RE = /^([^/]*)(\/([^/]+)\/)?([^/]*)$/i;

/**
 * Names types
 * @param {String} name
 * @returns {Object} Name parts
 * @private
 */

const parseName = (name) => {
	const value = {};
	const parts = name.match(NAME_RE);
	if (parts && parts[1]) value.givenName = parts[1].trim();
	if (parts && parts[3]) value.familyName = parts[3].trim();
	return value;
};

/**
 * Names types
 * @const NAME_TYPES
 * @type {Object}
 * @private
 */

const NAME_TYPES = {
	AKA: 'Also known as, alias', // Also know as, alias
	BIRTH: 'Name given at or near birth', // name given on birth certificate
	IMMIGRANT: 'Name assumed at the time of immigration', // name assumed at the time of immigration
	MAIDEN: 'Maiden name, name before first marriage', // maiden name, name before first marriage
	MARRIED: 'Married name, assumed as part of marriage', // name was person's previous married name
};

/**
 * Get occupation
 * @param {Object|string} val GEDCOM occupation
 * @returns {import('./types.js').ObjectLD} JSON-LD occupation
 * @private
 */

const getOccupation = (val) => {
	let occupation = createObject(schema);
	occupation.type = 'Occupation';
	occupation.name = val['@value'] || val;
	if (val.DATE) {
		const role = createObject(schema);
		role.type = 'Role';
		role.hasOccupation = occupation;
		const date = dateConverter(val.DATE).value;
		if (typeof date === 'string') {
			role.startDate = date;
		} else {
			const { start, end } = date;
			if (start) role.startDate = start;
			if (end) role.endDate = end;
		}
		occupation = role;
	}
	return occupation;
};

/**
 * Converter
 * @type {Function}
 * @param {import('../deserializer/individual.ts').Individual} obj The data object to transform
 * @returns {String} The converted string if applicable
 */

const converter = (obj) => {
	const value = createObject(schema);
	value.type = schema.TYPES.PERSON;
	const map = {
		SEX: (val) => {
			if (val !== 'U') value.gender = GENDER_TYPES[val] || val;
		},
		NAME: (nameObj) => {
			if (typeof nameObj === 'string') {
				Object.assign(value, parseName(nameObj));
			} else {
				const map = {
					'@value': (val) => {
						Object.assign(value, parseName(val));
					},
					'TYPE': (val) => {
						value.context.addVocabulary(rdfs);
						value[`${rdfs.PREFIX}:comment`] = NAME_TYPES[val.toUpperCase()] || val;
					},
					'NPFX': (val) => (value.honorificPrefix = val), // name prefix
					'GIVN': (val) => (value.givenName = val), // given name
					'NICK': (val) => {
						// nickname
						value.context.addVocabulary(foaf);
						value[`${foaf.PREFIX}:nick`] = val;
					},
					'SURN': (val) => {
						// surname
						value.familyName = [nameObj.SPFX, val].filter((p) => p).join(' ');
					},
					'NSFX': (val) => (value.honorificSuffix = val), // name suffix
					'FONE': (val) => addPhonetisation(value, 'name', { [val.TYPE]: val['@value'] }),
					'ROMN': (val) => addRomanisation(value, 'name', { [val.TYPE]: val['@value'] }),
				};
				mapObject(nameObj, map);
			}
			let name = [value.honorificPrefix, value.givenName, value['foaf:nick'] ? `"${value[`${foaf.PREFIX}:nick`]}"` : null, value.familyName].filter((p) => p).join(' ');
			if (value.honorificSuffix) name = `${name}, ${value.honorificSuffix}`;
			value.name = name;
		},
		FAMS: (val) => {
			if (val.HUSB === value) {
				value.spouse = val.WIFE;
			} else if (val.WIFE === value) {
				value.spouse = val.HUSB;
			}
		},
		FAMC: (val) => {
			value.parent = val.WIFE;
			value.parent = val.HUSB;
			val.WIFE.children = value;
			val.HUSB.children = value;
		},
		OCCU: (val) => {
			const occupation = getOccupation(val);
			if (value.hasOccupation) {
				if (!Array.isArray(value.hasOccupation)) value.hasOccupation = [value.hasOccupation];
				value.hasOccupation.push(occupation);
			} else {
				value.hasOccupation = occupation;
			}
		},
		BIRT: (val) => {
			value.birthDate = val.startDate;
			value.birthPlace = val.location;
		},
		DEAT: (val) => {
			value.deathDate = val.startDate;
			value.deathPlace = val.location;
		},
		...Array.from(event.keys())
			.filter((type) => !['BIRT', 'DEAT'].includes(type))
			.reduce((acc, key) => {
				acc[key] = (val) => {
					value.context.addVocabulary(bio);
					value[`${bio.PREFIX}:event`] = val;
				};
				return acc;
			}, {}),
		CHAN: (val) => {
			value.context.addVocabulary(dc);
			value[`${dc.PREFIX}:modified`] = dateConverter(val.DATE).value;
		},
		CREA: (val) => {
			value.context.addVocabulary(dc);
			value[`${dc.PREFIX}:created`] = dateConverter(val.DATE).value;
		},
		NOTE: (val) => {
			value.context.addVocabulary(rdfs);
			value[`${rdfs.PREFIX}:comment`] = val;
		},
		SNOTE: (val) => {
			value.context.addVocabulary(skos);
			value[`${skos.PREFIX}:note`] = val;
		},
		OBJE: (val) => {
			value.subjectOf = val;
		},
		SOUR: (val) => {
			value.subjectOf = val;
		},
	};
	const results = mapObject(obj, map);
	return { value, ...results };
};

/**
 * Name object converter
 * @type {Map}
 * @instance
 */

export default new Map([
	[INDIVIDUAL, converter],
	[NAME, noop],
]);
