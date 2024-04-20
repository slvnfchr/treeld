import { createObject, schema } from './context.js';
import { parse } from './place/location.js';
import { mapObject, renameProperty, deleteProperty } from './utils.js';

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
 * Place property transformer
 * @type {Function}
 * @param {Object} data The data object to transform
 * @param {String} property The target object property to transform
 * @returns {Object} The data object with the transformed property if applicable
 * @see http://wiki-en.genealogy.net/GEDCOM/PLAC-Tag
 * @instance
 */

export default (data, property) => {
	if (property !== 'PLAC') return data[property];
	let place = data[property];
	// Check place form local override
	if (place.FORM && !defaultForm) defaultForm = place.FORM;
	const form = place.FORM || defaultForm;
	// Simple place
	if (typeof place === 'string') {
		Object.assign(data, { [property]: { '@value': place } });
		place = data[property];
	}
	const value = place['@value'];
	if (!value) return data[property]; // Ignore header PLAC record
	place = createObject(schema, place);
	place.type = schema.TYPES.PLACE;
	// Place address parsing
	let address = parse(value, form);
	if (address) {
		address = createObject(schema, mapObject(address, POSTAL_ADDRESS));
		address.type = schema.TYPES.ADDRESS;
		Object.assign(place, { address });
	}
	// Phonetic version
	if (place.FONE) {
		// TODO Add phonetic version transform
	}
	// Romanised version
	if (place.ROMN) {
		// TODO Add phonetic version transform
	}
	// Convert coordinates to UTM (WGS84)
	if (place.MAP) {
		const latitude = place.MAP.LATI.match(GEO_RE);
		Object.assign(place, { latitude: `${latitude[1] === 'S' ? '-' : ''}${latitude[2]}` });
		const longitude = place.MAP.LONG.match(GEO_RE);
		Object.assign(place, { longitude: `${longitude[1] === 'W' ? '-' : ''}${longitude[2]}` });
		delete place.MAP;
	}
	renameProperty(place, '@value', 'name');
	deleteProperty(place, 'FORM');
	return place;
};
