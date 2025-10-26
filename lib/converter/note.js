import { SHARED_NOTE } from '../gedcom/constants.js';
import { createObject, schema } from './context.js';
import { converter as dateConverter } from './date.js';
import { mapObject } from './utils.js';

/**
 * @typedef {import('./types.ts').CreativeWorkLD} CreativeWorkLD
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<CreativeWorkLD>}
 * @param {import('../deserializer/note.ts').Note} obj The data object to transform
 * @returns {import('./types.ts').ConversionResult<CreativeWorkLD>} The conversion result
 */

const converter = (obj) => {
	const value = /** @type {CreativeWorkLD} */ (createObject(schema));
	value.type = schema.TYPES.CREATIVE_WORK;
	const map = {
		'@value': (val) => (value.text = val),
		'MIME': (val) => (value.encodingFormat = val),
		'LANG': (val) => (value.inLanguage = val),
		'TRAN': (val) => (value.workTranslation = converter(val).value),
		'SOUR': (val) => (value.subjectOf = val),
		'CREA': (val) => (value.dateCreated = dateConverter(val.DATE).value),
		'CHAN': (val) => (value.dateModified = dateConverter(val.DATE).value),
	};
	const results = mapObject(obj, map);
	return { value, ...results };
};

/**
 * Date object converter
 * @type {import("./types.js").ConversionMap}
 * @instance
 */

export default new Map([[SHARED_NOTE, converter]]);
