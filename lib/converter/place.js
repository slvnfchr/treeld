import { PLACE } from '../gedcom.js';
import { createObject, schema } from './context.js';
import { addPhonetisation, addRomanisation } from './text/index.js';
import { parse } from './location/index.js';
import { mapObject } from './utils.js';

/**
 * Parsed location to schema.org Place properties mapping
 * @const POSTAL_ADDRESS
 * @private
 */

const POSTAL_ADDRESS = {
	addressCountry: 'country',
	addressRegion: 'region',
	addressLocality: 'locality',
	postalCode: 'zipcode',
	streetAddress: 'address',
};

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
 * Place property converter
 * @type {Function}
 * @param {import('../deserializer').Chunk|String} obj The place object or string to transform
 * @returns {Object} The converted data object
 * @instance
 */

export const converter = (obj) => {
	let place;
	if (typeof obj === 'string') {
		place = converter({ '@value': obj });
	} else {
		// Check place form local override
		if (obj.FORM && !defaultForm) defaultForm = obj.FORM;
		const form = obj.FORM || defaultForm;
		const value = obj['@value'];
		if (!value) return null; // Ignore header PLAC record
		place = createObject(schema);
		place.type = schema.TYPES.PLACE;
		// Place address parsing
		let address = parse(value, form);
		if (address) {
			address = createObject(schema, mapObject(address, POSTAL_ADDRESS));
			address.type = schema.TYPES.ADDRESS;
			place.address = address;
		}
		place.name = obj['@value'];
		// Phonetic version
		if (obj.FONE) {
			addPhonetisation(place, 'name', { [obj.FONE.TYPE]: obj.FONE['@value'] });
		}
		if (obj.ROMN) {
			addRomanisation(place, 'name', { [obj.ROMN.TYPE]: obj.ROMN['@value'] });
		}
		// Convert coordinates to UTM (WGS84)
		if (obj.MAP && GEO_RE.test(obj.MAP.LATI) && GEO_RE.test(obj.MAP.LONG)) {
			const latitude = obj.MAP.LATI.match(GEO_RE);
			place.latitude = `${latitude[1] === 'S' ? '-' : ''}${latitude[2]}`;
			const longitude = obj.MAP.LONG.match(GEO_RE);
			place.longitude = `${longitude[1] === 'W' ? '-' : ''}${longitude[2]}`;
		}
	}
	return place;
};

/**
 * Place obj converter
 * @type {Map}
 * @instance
 */

export default new Map([[PLACE, converter]]);
