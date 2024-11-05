import { PLACE } from '../gedcom.js';
import { createObject, schema } from './context.js';
import { addPhonetisation, addRomanisation } from './text/index.js';
import { parse } from './location/index.js';
import { mapObject } from './utils.js';

/**
 * Latitude/longitude values parsing regular expression
 * @const GEO_RE
 * @type {RegExp}
 * @private
 */

const GEO_RE = /([NESW]{1})([0-9.]+)/i;

/**
 * Place parsing pattern
 * @type {String}
 * @private
 */

let defaultForm;

/**
 * @typedef {import('../deserializer/location').Place} Place
 * @typedef {import('./types.ts').PlaceLD} PlaceLD
 */

/**
 * Place property converter
 * @type {import('./types.ts').Converter<PlaceLD>}
 * @param {Place} obj The data object to transform
 * @returns {import('./types.ts').ConversionResult<PlaceLD>} The conversion result
 * @instance
 */

export const converter = (obj) => {
	let value;
	let errors;
	if (typeof obj === 'string') {
		return converter({ '@value': obj });
	} else if (obj.FORM && !defaultForm && !obj['@value']) {
		// Check place form local override
		defaultForm = obj.FORM;
		return { value: null };
	} else if (obj['@value']) {
		const form = obj.FORM || defaultForm;
		value = createObject(schema);
		value.type = schema.TYPES.PLACE;
		const map = {
			'@value': (val) => {
				// Place address parsing
				const location = parse(val, form);
				if (location) {
					const address = createObject(schema);
					address.type = schema.TYPES.ADDRESS;
					const map = {
						country: (val) => (address.addressCountry = val),
						region: (val) => (address.addressRegion = val),
						locality: (val) => (address.addressLocality = val),
						zipcode: (val) => (address.postalCode = val),
						address: (val) => (address.streetAddress = val),
					};
					mapObject(location, map);
					value.address = address;
				}
				value.name = val;
			},
			'FONE': (val) => addPhonetisation(value, 'name', { [val.TYPE]: val['@value'] }),
			'ROMN': (val) => addRomanisation(value, 'name', { [val.TYPE]: val['@value'] }),
			'MAP': (val) => {
				// Convert coordinates to UTM (WGS84)
				if (GEO_RE.test(val.LATI) && GEO_RE.test(val.LONG)) {
					const latitude = val.LATI.match(GEO_RE);
					value.latitude = `${latitude[1] === 'S' ? '-' : ''}${latitude[2]}`;
					const longitude = val.LONG.match(GEO_RE);
					value.longitude = `${longitude[1] === 'W' ? '-' : ''}${longitude[2]}`;
				}
			},
		};
		errors = mapObject(obj, map);
		const error = Object.keys(errors).length && new Error(`The following properties conversion fail: ${Object.keys(errors).join(', ')}`);
		const ignore = Object.keys(obj).filter((name) => !map[name]);
		const warn = ignore.length && `The ${ignore.join(', ')} properties were not converted for ${obj['@type']} object`;
		return { value, ...(warn && { warn }), ...(error && { error }) };
	}
};

/**
 * Place obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[PLACE, converter]]);
