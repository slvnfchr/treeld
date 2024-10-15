import { ADDRESS } from '../gedcom.js';
import { createObject, mapProperties, schema } from './context.js';

/**
 * Converter
 * @type {Function}
 * @param {Object} obj The data object to transform
 * @returns {String} The converted string if applicable
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
 * @type {Map}
 * @instance
 */

export default new Map([[ADDRESS, converter]]);
