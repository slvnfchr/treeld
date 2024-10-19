import { PLACE } from '../gedcom.js';
import { createObject, schema } from './context.js';
import { parse } from './place/index.js';
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
 * @type {RexExp}
 * @private
 */

const GEO_RE = /([NESW]{1})([0-9.]+)/i;

// https://github.com/buda-base/owl-schema/blob/master/lang-tags.md
// https://tools.ietf.org/html/bcp47
const PHONETISATION = /hangul|kana/i;
const ROMANISATION = /pinyin|romaji|wadegiles/i;

/**
 * Place parsing pattern
 * @type {String}
 * @private
 */

let defaultForm;

/**
 * Place property converter
 * @type {Function}
 * @param {Object|String} obj The place object or string to transform
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
		// Phonetic version
		if (obj.FONE) {
			// TODO Add phonetic version transform
		}
		// Romanised version
		if (obj.ROMN) {
			// TODO Add phonetic version transform
		}
		// Convert coordinates to UTM (WGS84)
		if (obj.MAP && GEO_RE.test(obj.MAP.LATI) && GEO_RE.test(obj.MAP.LONG)) {
			const latitude = obj.MAP.LATI.match(GEO_RE);
			place.latitude = `${latitude[1] === 'S' ? '-' : ''}${latitude[2]}`;
			const longitude = obj.MAP.LONG.match(GEO_RE);
			place.longitude = `${longitude[1] === 'W' ? '-' : ''}${longitude[2]}`;
		}
		place.name = obj['@value'];
	}
	return place;
};

/**
 * Place obj converter
 * @type {Map}
 * @instance
 */

export default new Map([[PLACE, converter]]);
