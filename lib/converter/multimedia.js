import { MULTIMEDIA } from '../gedcom/constants.js';
import { createObject, schema, rdfs } from './context.js';
import { converter as dateConverter } from './date.js';
import { converter as fileConverter } from './file.js';
import { mapObject } from './utils.js';

/**
 * @typedef {import('./types.ts').DigitalDocumentLD} DigitalDocumentLD
 * @typedef {import('../deserializer/multimedia.ts')} MultimediaLink
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<DigitalDocumentLD>}
 * @param {import('../deserializer/multimedia.ts').MultimediaRecord} obj The data object to transform
 * @returns {import('./types.ts').ConversionResult<DigitalDocumentLD>} The conversion result
 */

const converter = (obj) => {
	const value = /** @type {DigitalDocumentLD} */ (createObject(schema));
	value.type = schema.TYPES.DIGITAL_DOCUMENT;
	let results;
	if (!obj['@value']) {
		const map = {
			RESN: (val) => (value.conditionsOfAccess = val),
			FILE: (val) => (value.associatedMedia = typeof val === 'string' ? fileConverter(val).value : val),
			NOTE: (val) => {
				value.context.addVocabulary(rdfs);
				value[`${rdfs.PREFIX}:comment`] = val.NOTE;
			},
			CREA: (val) => {
				const date = dateConverter(val.DATE).value;
				value.dateCreated = date;
			},
			CHAN: (val) => {
				const date = dateConverter(val.DATE).value;
				value.dateModified = date;
			},
		};
		results = mapObject(obj, map);
	} else {
		// Multimedia link
		const multimedia = /** @type {MultimediaLink} */ (obj);
		const map = {
			'@value': (val) => (value.sameAs = val),
			'TITL': (val) => (value.name = val),
		};
		results = mapObject(multimedia, map);
	}
	return { value, ...results };
};

/**
 * Multimedia object converter
 * @type {import("./types.js").ConversionMap}
 * @instance
 */

export default new Map([[MULTIMEDIA, converter]]);
