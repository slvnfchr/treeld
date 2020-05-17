
/**
 * Location parsing module
 * @module
 */

import fs from 'fs';
import path from 'path';

const TYPES = {
	COUNTRY: /country/i,
	REGION: /(state|region)/i,
	LOCALITY: /(city|town|place)/i,
	ZIPCODE: /area\scode/i,
	DISTRICT: /(county|district)/i,
	ADDRESS: /subdivision/i,
};

const DEFAULT = 'place, county/district, state, country'; // Recommended form

const INDEX = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'data/places/countries.jsonld'), { encoding: 'utf8' }))['@graph'];
const COUNTRIES = INDEX.map((c) => {
	const names = [c.name];
	if (c.alternateName && typeof c.alternateName === 'string') names.push(c.alternateName);
	if (c.alternateName && Array.isArray(c.alternateName)) names.push(...c.alternateName.map((n) => n['@value']));
	return { name: new RegExp(`^(${names.join('|')})$`), data: c };
});

/**
 * @function getType
 * @param {String} part A place pattern part
 * @returns {String} A corresponding data type
 * @private
 */

const getType = (part) => Object.keys(TYPES).reduce((found, key) => ((TYPES[key].test(part) && key) || found), part);

/**
 * @function parse
 * @param {String} str The GEDCOM location record
 * @param {String} pattern The pattern of PLAC record
 * @returns {Object} An object with administratives areas corresponding to record
 * @instance
 */

export const parse = (str, pattern) => { // eslint-disable-line import/prefer-default-export
	const parts = str.split(',').map((j) => j.trim());
	const types = (pattern || DEFAULT).split(',').map(getType);
	// Pattern and string don't match, search country to determine right pattern
	if (parts.length <= types.length && !pattern) {
		const { position, zipcode } = parts.reduce((found, part, i) => {
			if (found.position === -1) {
				const country = COUNTRIES.find((c) => c.name.test(part));
				if (country) {
					const zip = country.data.additionalProperty.find((property) => (property.propertyID === 'Postal code scheme'));
					return { position: i, zipcode: (zip && (new RegExp(zip.value))) };
				}
			}
			return found;
		}, { position: -1, zipcode: null });
		if (position !== -1) {
			types.splice(Math.min(1, position), types.indexOf('COUNTRY') - position);
			const zip = zipcode && parts.findIndex((part) => zipcode.test(part));
			if (zip !== -1) types[zip] = 'ZIPCODE';
		}
	}
	const location = types.reduce((obj, type, index) => Object.assign(obj, { [type.toLowerCase()]: parts[index] }), {});
	return location;
};
