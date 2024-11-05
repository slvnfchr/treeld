import { DATE } from '../gedcom.js';
import { parse } from './datetime/index.js';

/**
 * @typedef {import('./types.ts').DateISO} DateISO
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<DateISO>}
 * @param {import('../deserializer/date').Date|String} obj The data object or string to transform
 * @returns {import('./types.ts').ConversionResult<DateISO>} The conversion result
 * @instance
 */

export const converter = (obj) => {
	let result;
	if (typeof obj === 'string') {
		result = converter({ '@value': obj }).value;
	} else {
		result = obj['@value'];
		const d = parse(result);
		if (d) {
			if (obj.TIME) d.setTime(obj.TIME);
			result = d.toISOString();
		}
	}
	return { value: result };
};

/**
 * Date object converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[DATE, converter]]);
