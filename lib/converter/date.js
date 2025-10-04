import { DATE } from '../gedcom/constants.js';
import { parse, Interval } from './datetime/index.js';

/**
 * @typedef {import('./types.ts').Date} Date
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<Date>}
 * @param {import('../deserializer/date').Date|Date|String} obj The data object or string to transform
 * @returns {import('./types.ts').ConversionResult<Date>} The conversion result
 * @instance
 */

export const converter = (obj) => {
	let result;
	if (typeof obj === 'string') {
		result = converter({ '@value': obj }).value;
	} else if (obj['@value']) {
		const d = parse(obj['@value']);
		if (d) {
			if (d instanceof Interval) {
				if (d.period) {
					result = { start: d.start.toISOString(), end: d.end.toISOString() };
				} else {
					result = d.toISOString();
				}
			} else {
				if (obj.TIME) d.setTime(obj.TIME);
				result = d.toISOString();
				// TODO handle estimated date description
			}
		} else {
			// TODO detect ISO format
			result = obj['@value'];
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
