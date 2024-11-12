import { INDIVIDUAL, NAME } from '../gedcom.js';
import { createObject, schema, foaf, rdfs } from './context.js';
import { addPhonetisation, addRomanisation } from './text/index.js';
import { mapObject, noop } from './utils.js';
import { converter as dateConverter } from './date.js';


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
 * @param {Object} obj The data object to transform
 * @returns {String} The converted string if applicable
 */

const converter = (obj) => {
	const value = createObject(schema);
	value.type = schema.TYPES.PERSON;
	const map = {
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
		OCCU: (val) => {
			const occupation = getOccupation(val);
			if (value.hasOccupation) {
				if (!Array.isArray(value.hasOccupation)) value.hasOccupation = [value.hasOccupation];
				value.hasOccupation.push(occupation);
			} else {
				value.hasOccupation = occupation;
			}
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
