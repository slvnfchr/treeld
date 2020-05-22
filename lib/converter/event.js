
import { createObject, bio, rdfs } from './context';
import { renameProperty } from './utils';

/**
 * GEDCOM events types to vocabularies mapping
 * @private
 */

const TYPES_INDIVIDUAL = {
	ADOP: bio.TYPES.ADOPTION,
	BIRT: bio.TYPES.BIRTH,
	BAPM: bio.TYPES.BAPTISM,
	BARM: bio.TYPES.BAR_MITZVAH,
	BASM: bio.TYPES.BAS_MITZVAH,
	BURI: bio.TYPES.BURIAL,
	CENS: {
		'@id': 'Census',
		label: 'Census',
		comment: 'The event of the periodic count of the population for a designated locality, such as a national or state Census.',
	},
	CHR: {
		'@id': 'Christening',
		label: 'Christening',
		comment: 'The religious event of baptising and naming a child.',
	},
	CHRA: {
		'@id': 'AdultChristening',
		label: 'Adult christening',
		comment: 'The religious event of baptizing and naming an adult person.',
	},
	CONF: {
		'@id': 'Confirmation',
		label: 'Confirmation',
		comment: 'The religious rite that confirms membership of a church (confirms because previously established by baptism).',
	},
	CREM: bio.TYPES.CREMATION,
	DEAT: bio.TYPES.DEATH,
	EMIG: bio.TYPES.EMIGRATION,
	FCOM: {
		'@id': 'FirstCommunion',
		label: 'First communion',
		comment: 'A religious rite, the first act of sharing in the Lord\'s supper as part of church worship.',
	},
	GRAD: bio.TYPES.GRADUATION,
	IMMI: {
		'@id': 'Immigration',
		label: 'Immigration',
		comment: 'An event of entering into a new locality with the intent of residing there.',
	},
	NATU: bio.TYPES.NATURALIZATION,
	RETI: bio.TYPES.RETIREMENT,
	PROB: {
		'@id': 'Probate',
		label: 'Probate',
		comment: 'An event of judicial determination of the validity of a will. May indicate several related court activities over several dates.',
	},
	WILL: {
		'@id': 'Will',
		label: 'Will',
		comment: 'A legal document treated as an event, by which a person disposes of his or her estate, to take effect after death.',
	},
};
Object.values(TYPES_INDIVIDUAL).filter((type) => typeof type !== 'string').forEach((type) => {
	createObject(rdfs, type);
	type.context.setDefault(bio);
	type.type = bio.TYPES.EVENT_INDIVIDUAL; // eslint-disable-line no-param-reassign
});

const TYPES_GROUP = {
	ANUL: bio.TYPES.ANNULMENT,
	DIV: bio.TYPES.DIVORCE,
	ENGA: {
		'@id': 'Engagement',
		label: 'Engagement',
		comment: 'An event of recording or announcing an agreement between two people to become married.',
	},
	MARR: bio.TYPES.MARRIAGE,
	MARB: {
		'@id': 'MarriageBann',
		label: 'Banns of marriage',
		comment: 'An event of an official public notice given that two people intend to marry.',
	},
	MARC: {
		'@id': 'MarriageContract',
		label: 'Marriage contract',
		comment: 'An event of recording a formal agreement of marriage.',
	},
	MARL: {
		'@id': 'MarriageLicense',
		label: 'Marriage license',
		comment: 'An event of obtaining a legal license to marry.',
	},
	MARS: {
		'@id': 'MarriageSettlement',
		label: 'Marriage settlement',
		comment: 'An event of creating an agreement between two people contemplating marriage.',
	},
};
Object.values(TYPES_GROUP).filter((type) => typeof type !== 'string').forEach((type) => {
	createObject(rdfs, type);
	type.context.setDefault(bio);
	type.type = bio.TYPES.EVENT_GROUP; // eslint-disable-line no-param-reassign
});
/**
 * Get type value from GEDCOM tag
 * @function getType
 * @param {String} tag The GEDCOM tag name
 * @private
 */

const getType = (tag, types) => Object.entries(types).reduce((found, [type, value]) => (found || (tag === type && value)), null);

/**
 * Event property transformer
 * @type {Function}
 * @param {Object} data The data object to transform
 * @param {String} property The target object property to transform
 * @param {Transform} stream The transform stream from which transformer is called to emit additional chunk if needed
 * @returns {Object} The data object with the transformed property if applicable
 * @instance
 */

export default (data, property, stream) => {
	const individual = getType(property, TYPES_INDIVIDUAL);
	const group = getType(property, TYPES_GROUP);
	if (!individual && !group && property !== 'EVEN' && property !== 'FACT') return data[property];
	let event = data[property];
	// Simple event
	if (typeof event === 'string') {
		Object.assign(data, { [property]: { '@value': event } });
		event = data[property];
	}
	event = createObject(bio, event);
	if (individual) {
		if (typeof individual === 'string') {
			event.type = individual;
		} else {
			stream.push({ data: individual });
			event.type = `#${individual['@id']}`;
		}
	}
	if (group) {
		if (typeof group === 'string') {
			event.type = group;
		} else {
			stream.push({ data: group });
			event.type = `#${group['@id']}`;
		}
	}
	// A descriptive word or phrase used to further classify the event
	if (event.TYPE) {
		event.type = bio.TYPES.EVENT_INDIVIDUAL;
		event.context.add(rdfs);
		renameProperty(event, 'TYPE', `${rdfs.PREFIX}:comment`);
	}
	// Date
	if (event.DATE) {
		renameProperty(event, 'DATE', 'date');
	}
	// Date
	if (event.PLAC) {
		renameProperty(event, 'PLAC', 'place');
	}
	// Family link
	if (event.FAMC) {
		// TODO Handle FAMC record
		if (event.FAMC.ADOP) {
			// TODO Handle ADOP record
		}
	}
	if (event.AGE) {
		// TODO Parse age at event
	}
	return event;
};
