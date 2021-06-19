import { createObject, mapProperties, schema } from './context';

/**
 * Address property transformer
 * @type {Function}
 * @param {Object} data The data object to transform
 * @param {String} property The target object property to transform
 * @returns {Object} The data object with the transformed property if applicable
 * @instance
 */

export default (data, property) => {
	if (property !== 'ADDR') return data;
	const address = createObject(schema, data[property]);
	address.type = schema.TYPES.ADDRESS;
	mapProperties(address, {
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
