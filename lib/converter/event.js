import { EVENT, FACT, INDIVIDUAL_EVENT, FAMILY_EVENT } from '../gedcom/constants.js';
import { createObject, bio, foaf, rdfs, schema } from './context.js';
import { mapObject } from './utils.js';
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
	[INDIVIDUAL_EVENT.ADOP, bio.TYPES.ADOPTION],
	[INDIVIDUAL_EVENT.BIRT, bio.TYPES.BIRTH],
	[INDIVIDUAL_EVENT.BAPM, bio.TYPES.BAPTISM],
	[INDIVIDUAL_EVENT.BARM, bio.TYPES.BAR_MITZVAH],
	[INDIVIDUAL_EVENT.BASM, bio.TYPES.BAS_MITZVAH],
	[INDIVIDUAL_EVENT.BURI, bio.TYPES.BURIAL],
	[
		'CENS',
		createEventType({
			'@id': 'Census',
			'label': 'Census',
			'comment': 'The event of the periodic count of the population for a designated locality, such as a national or state Census.',
		}),
	],
	[
		INDIVIDUAL_EVENT.CHR,
		createEventType({
			'@id': 'Christening',
			'label': 'Christening',
			'comment': 'The religious event of baptising and naming a child.',
		}),
	],
	[
		INDIVIDUAL_EVENT.CHRA,
		createEventType({
			'@id': 'AdultChristening',
			'label': 'Adult christening',
			'comment': 'The religious event of baptizing and naming an adult person.',
		}),
	],
	[
		INDIVIDUAL_EVENT.CONF,
		createEventType({
			'@id': 'Confirmation',
			'label': 'Confirmation',
			'comment': 'The religious rite that confirms membership of a church (confirms because previously established by baptism).',
		}),
	],
	[INDIVIDUAL_EVENT.CREM, bio.TYPES.CREMATION],
	[INDIVIDUAL_EVENT.DEAT, bio.TYPES.DEATH],
	[INDIVIDUAL_EVENT.EMIG, bio.TYPES.EMIGRATION],
	[
		INDIVIDUAL_EVENT.FCOM,
		createEventType({
			'@id': 'FirstCommunion',
			'label': 'First communion',
			'comment': "A religious rite, the first act of sharing in the Lord's supper as part of church worship.",
		}),
	],
	[INDIVIDUAL_EVENT.GRAD, bio.TYPES.GRADUATION],
	[
		INDIVIDUAL_EVENT.IMMI,
		createEventType({
			'@id': 'Immigration',
			'label': 'Immigration',
			'comment': 'An event of entering into a new locality with the intent of residing there.',
		}),
	],
	[INDIVIDUAL_EVENT.NATU, bio.TYPES.NATURALIZATION],
	[INDIVIDUAL_EVENT.RETI, bio.TYPES.RETIREMENT],
	[
		INDIVIDUAL_EVENT.PROB,
		createEventType({
			'@id': 'Probate',
			'label': 'Probate',
			'comment': 'An event of judicial determination of the validity of a will. May indicate several related court activities over several dates.',
		}),
	],
	[
		INDIVIDUAL_EVENT.WILL,
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
 * @typedef {import('../deserializer/event.ts').EventDetail} EventDetail
 * @typedef {import('../deserializer/event.ts').FamilyEventDetail} FamilyEventDetail
 * @typedef {import('./types.ts').EventLD} EventLD
 */

/**
 * Event object converter
 * @type {import('./types.ts').Converter<EventLD>}
 * @param {EventDetail|FamilyEventDetail} obj The data object to transform
 * @param {TransformStreamDefaultController} controller The transform stream controller
 * @returns {import('./types.ts').ConversionResult<EventLD>} The conversion result
 */

const converter = (obj, controller) => {
	const value = createObject(schema);
	value.type = schema.TYPES.EVENT;
	const map = {
		'@type': (val) => {
			const individual = val && TYPES_INDIVIDUAL.get(val);
			const group = val && TYPES_GROUP.get(val);
			const knownType = individual || group;
			if (knownType) {
				if (typeof knownType === 'string') {
					value.additionalType = knownType;
				} else {
					controller.enqueue(knownType);
					value.additionalType = `#${knownType['@id']}`;
				}
			}
		},
		'TYPE': (val) => {
			// A descriptive word or phrase used to further classify the event
			value.additionalType = bio.TYPES.EVENT_INDIVIDUAL;
			value.name = val;
		},
		'DATE': (val) => (value.startDate = dateConverter(val).value),
		'PLAC': (val) => (value.location = typeof val === 'string' ? placeConverter(val).value : val),
		'NOTE': (val) => {
			value.context.addVocabulary(rdfs);
			value[`${rdfs.PREFIX}:comment`] = val;
		},
	};
	const results = mapObject(obj, map);
	return { value, ...results };
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
