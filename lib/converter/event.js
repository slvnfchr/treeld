import { EVENT, FACT } from '../gedcom.js';
import { createObject, bio, rdfs, schema } from './context.js';
import { converter as dateConverter } from './date.js';
import { converter as placeConverter } from './place.js';

/**
 * Create custom type
 * @function createEventType
 * @param {Object} properties Event type properties object
 * @returns {Object} The JSON-LD event type object
 * @private
 */

const createEventType = (properties) => {
	const type = createObject(rdfs, properties);
	type.context.setDefault(bio);
	type.type = bio.TYPES.EVENT_GROUP; // eslint-disable-line no-param-reassign
	return type;
};

/**
 * GEDCOM events types to vocabularies mapping
 * @private
 */

const TYPES_INDIVIDUAL = new Map([
	['ADOP', bio.TYPES.ADOPTION],
	['BIRT', bio.TYPES.BIRTH],
	['BAPM', bio.TYPES.BAPTISM],
	['BARM', bio.TYPES.BAR_MITZVAH],
	['BASM', bio.TYPES.BAS_MITZVAH],
	['BURI', bio.TYPES.BURIAL],
	[
		'CENS',
		createEventType({
			'@id': 'Census',
			'label': 'Census',
			'comment': 'The event of the periodic count of the population for a designated locality, such as a national or state Census.',
		}),
	],
	[
		'CHR',
		createEventType({
			'@id': 'Christening',
			'label': 'Christening',
			'comment': 'The religious event of baptising and naming a child.',
		}),
	],
	[
		'CHRA',
		createEventType({
			'@id': 'AdultChristening',
			'label': 'Adult christening',
			'comment': 'The religious event of baptizing and naming an adult person.',
		}),
	],
	[
		'CONF',
		createEventType({
			'@id': 'Confirmation',
			'label': 'Confirmation',
			'comment': 'The religious rite that confirms membership of a church (confirms because previously established by baptism).',
		}),
	],
	['CREM', bio.TYPES.CREMATION],
	['DEAT', bio.TYPES.DEATH],
	['EMIG', bio.TYPES.EMIGRATION],
	[
		'FCOM',
		createEventType({
			'@id': 'FirstCommunion',
			'label': 'First communion',
			'comment': "A religious rite, the first act of sharing in the Lord's supper as part of church worship.",
		}),
	],
	['GRAD', bio.TYPES.GRADUATION],
	[
		'IMMI',
		createEventType({
			'@id': 'Immigration',
			'label': 'Immigration',
			'comment': 'An event of entering into a new locality with the intent of residing there.',
		}),
	],
	['NATU', bio.TYPES.NATURALIZATION],
	['RETI', bio.TYPES.RETIREMENT],
	[
		'PROB',
		createEventType({
			'@id': 'Probate',
			'label': 'Probate',
			'comment': 'An event of judicial determination of the validity of a will. May indicate several related court activities over several dates.',
		}),
	],
	[
		'WILL',
		createEventType({
			'@id': 'Will',
			'label': 'Will',
			'comment': 'A legal document treated as an event, by which a person disposes of his or her estate, to take effect after death.',
		}),
	],
]);

const TYPES_GROUP = new Map([
	['ANUL', bio.TYPES.ANNULMENT],
	['DIV', bio.TYPES.DIVORCE],
	[
		'ENGA',
		createEventType({
			'@id': 'Engagement',
			'label': 'Engagement',
			'comment': 'An event of recording or announcing an agreement between two people to become married.',
		}),
	],
	['MARR', bio.TYPES.MARRIAGE],
	[
		'MARB',
		createEventType({
			'@id': 'MarriageBann',
			'label': 'Banns of marriage',
			'comment': 'An event of an official public notice given that two people intend to marry.',
		}),
	],
	[
		'MARC',
		createEventType({
			'@id': 'MarriageContract',
			'label': 'Marriage contract',
			'comment': 'An event of recording a formal agreement of marriage.',
		}),
	],
	[
		'MARL',
		createEventType({
			'@id': 'MarriageLicense',
			'label': 'Marriage license',
			'comment': 'An event of obtaining a legal license to marry.',
		}),
	],
	[
		'MARS',
		createEventType({
			'@id': 'MarriageSettlement',
			'label': 'Marriage settlement',
			'comment': 'An event of creating an agreement between two people contemplating marriage.',
		}),
	],
]);

/**
 * @typedef {import('../deserializer/event').EventDetail} EventDetail
 * @typedef {import('../deserializer/event').FamilyEventDetail} FamilyEventDetail
 * @typedef {import('./types.ts').EventLD} EventLD
 */

/**
 * Event object converter
 * @type {import('./types.ts').Converter<EventLD>}
 * @param {EventDetail|FamilyEventDetail} obj The data object to transform
 * @param {TransformStreamDefaultController} controller The transform stream controller
 * @returns {import('./types.ts').EventLD} The converted data object
 */

const converter = (obj, controller) => {
	const individual = obj['@type'] && TYPES_INDIVIDUAL.get(obj['@type']);
	const group = obj['@type'] && TYPES_GROUP.get(obj['@type']);
	let event;
	if (individual || group || obj.TYPE) {
		event = createObject(schema);
		event.type = schema.TYPES.EVENT;
		if (individual) {
			if (typeof individual === 'string') {
				event.additionalType = individual;
			} else {
				controller.enqueue(individual);
				event.additionalType = `#${individual['@id']}`;
			}
		}
		if (group) {
			if (typeof group === 'string') {
				event.additionalType = group;
			} else {
				controller.enqueue(group);
				event.additionalType = `#${group['@id']}`;
			}
		}
		// A descriptive word or phrase used to further classify the event
		if (obj.TYPE) {
			event.additionalType = bio.TYPES.EVENT_INDIVIDUAL;
			event.context.addVocabulary(rdfs);
			event[`${rdfs.PREFIX}:comment`] = obj.TYPE;
		}
		// Date
		if (obj.DATE) {
			event.startDate = dateConverter(obj.DATE);
		}
		// Date
		if (obj.PLAC) {
			event.location = placeConverter(obj.PLAC);
		}
		// TODO Handle family child link
		// TODO Parse age at event
	}
	return event;
};

/**
 * Events obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([
	...new Map(Array.from(TYPES_INDIVIDUAL.keys()).map((type) => [type, converter])),
	...new Map(Array.from(TYPES_GROUP.keys()).map((type) => [type, converter])),
	[EVENT, converter],
	[FACT, converter],
]);
