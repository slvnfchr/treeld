import { CHANGE_DATE, CREATION_DATE } from '../gedcom/constants.js';

/**
 * Passthrough converter
 * @type {import('./types.ts').Converter<Object>}
 * @param {import('../deserializer/types.ts').Chunk} obj The data object or string to transform
 * @returns {import('./types.ts').ConversionResult<Object>} The conversion result
 * @instance
 */

export const converter = (obj) => {
	return { value: obj };
};

/**
 * Date object converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([
	[CREATION_DATE, converter],
	[CHANGE_DATE, converter],
]);
