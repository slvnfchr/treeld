import { ADDRESS } from '../gedcom.js';
import { createObject, mapProperties, schema } from './context.js';

/**
 * @typedef {import('./types.ts').AddressLD} AddressLD
 */

/**
 * Converter
 * @type {import('./types.ts').Converter<AddressLD>}
 * @param {import('../deserializer/location.ts').Address} obj The data object to transform
 * @returns {import('./types.ts').AddressLD>} The conversion result
 */

const converter = (obj) => {
	const address = createObject(schema);
	address.type = schema.TYPES.ADDRESS;
	mapProperties(obj, address, {
		ADR1: 'streetAddress',
		ADR2: 'streetAddress',
		ADR3: 'streetAddress',
		POST: 'postalCode',
		CITY: 'addressLocality',
		STAE: 'addressRegion',
		CTRY: 'addressCountry',
	});
	return address;
};

/**
 * Date object converter
 * @type {import("./types.js").ConversionMap}
 * @instance
 */

export default new Map([[ADDRESS, converter]]);
