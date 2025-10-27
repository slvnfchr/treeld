import { AGE } from '../gedcom/constants.js';
import { createObject, schema } from './context.js';

const AGE_RE = /([<>]{1})?\s*([0-9]{1,3}y)?\s*([0-9]{1,2}m)?\s*([0-9]{1,3}d)?/i;

/**
 * @function parse
 * @param {String} str The GEDCOM age record
 * @returns {Object} An object
 * @instance
 */

const parse = (str) => {
	if (AGE_RE.test(str)) {
		const parts = str.match(AGE_RE);
		const minimum = parts[1] === '>';
		const exact = !parts[1];
		const years = (parts[2] || '').toUpperCase();
		const months = (parts[3] || '').toUpperCase();
		const days = (parts[4] || '').toUpperCase();
		const value = `P${years}${months}${days}`;
		return { exact, minimum, value };
	}
};

/**
 * @typedef {import('./types.ts').DurationLD} DurationLD
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<DurationLD>}
 * @param {import('../deserializer/date').Age} obj The data object or string to transform
 * @returns {import('./types.ts').ConversionResult<DurationLD>} The conversion result
 * @instance
 */

export const converter = (obj) => {
	const value = /** @type {DurationLD} */ (createObject(schema));
	value.type = schema.TYPES.DURATION;
	const age = parse(obj['@value'] || obj);
	if (age) {
		if (age.exact) {
			value.value = age.value;
		} else if (age.minimum) {
			value.minValue = age.value;
		} else {
			value.maxValue = age.value;
		}
	} else {
		value.value = obj['@value'];
	}
	if (obj.PHRASE) {
		value.description = obj.PHRASE;
	}
	return { value };
};

/**
 * Date object converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[AGE, converter]]);
