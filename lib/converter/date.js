import { DATE } from '../gedcom.js';
import { parse } from './datetime/index.js';

/**
 * Converter
 * @type {Function}
 * @param {import('../deserializer/date').Date|String} obj The data object or string to transform
 * @returns {import('./date').DateISO|undefined} The converted string if applicable
 * @instance
 */

export const converter = (obj) => {
	let result;
	if (typeof obj === 'string') {
		result = converter({ '@value': obj });
	} else {
		result = obj['@value'];
		const d = parse(result);
		if (d) {
			if (obj.TIME) d.setTime(obj.TIME);
			result = d.toISOString();
		}
	}
	return result;
};

/**
 * Date object converter
 * @type {Map}
 * @instance
 */

export default new Map([[DATE, converter]]);
