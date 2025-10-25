import { FILE } from '../gedcom/constants.js';
import { createObject, schema } from './context.js';
import { mapObject } from './utils.js';

/**
 * @typedef {import('./types.ts').MediaLD} MediaLD
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<MediaLD>}
 * @param {import('../deserializer/multimedia.ts').File} obj The data object or string to transform
 * @returns {import('./types.ts').ConversionResult<MediaLD>} The conversion result
 * @instance
 */

export const converter = (obj) => {
	let result;
	if (typeof obj === 'string') {
		result = converter({ '@value': obj }).value;
	} else if (obj['@value']) {
		const media = createObject(schema);
		media.type = schema.TYPES.MEDIA;
		const map = {
			'@value': (val) => (media.contentUrl = val),
			'TITL': (val) => (media.name = val),
			'FORM': (val) => (media.encodingFormat = val),
			'TRAN': (val) => (media.workTranslation = converter(val).value),
		};
		mapObject(obj, map);
		result = media;
	}
	return { value: result };
};

/**
 * File object converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[FILE, converter]]);
