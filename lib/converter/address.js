import { ADDRESS } from '../gedcom.js';
import { createObject, schema } from './context.js';
import { mapObject } from './utils.js';

/**
 * @typedef {import('./types.ts').AddressLD} AddressLD
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<AddressLD>}
 * @param {import('../deserializer/location.ts').Address} obj The data object to transform
 * @returns {import('./types.ts').ConversionResult<AddressLD>} The conversion result
 */

const converter = (obj) => {
	const value = /** @type {AddressLD} */ (createObject(schema));
	value.type = schema.TYPES.ADDRESS;
	const map = {
		ADR1: (val) => (value.streetAddress = val),
		ADR2: (val) => (value.streetAddress = val),
		ADR3: (val) => (value.streetAddress = val),
		POST: (val) => (value.postalCode = val),
		CITY: (val) => (value.addressLocality = val),
		STAE: (val) => (value.addressRegion = val),
		CTRY: (val) => (value.addressCountry = val),
	};
	const results = mapObject(obj, map);
	return { value, ...results };
};

/**
 * Date object converter
 * @type {import("./types.js").ConversionMap}
 * @instance
 */

export default new Map([[ADDRESS, converter]]);
