import { DATE } from '../gedcom.js';
import { parse } from './date/index.js';

/**
 * Converter
 * @type {Function}
 * @param {Object} obj The data object to transform
 * @returns {String} The converted string if applicable
 */

const converter = (obj) => {
	let result;
	if (obj['@type'] === DATE) {
		const d = parse(obj['@value']);
		if (obj.TIME) d.setTime(obj.TIME);
		result = d.toISOString();
	}
	return result;
};

/**
 * Date object converter
 * @type {Map}
 * @instance
 */

export default new Map([[DATE, converter]]);
