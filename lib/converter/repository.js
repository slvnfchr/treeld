import { createObject, schema, rdfs } from './context.js';
import { mapObject } from './utils.js';
import { REPOSITORY } from '../gedcom.js';
import { converter as dateConverter } from './date.js';

/**
 * @typedef {import('../deserializer/source').Repository} Repository
 * @typedef {import('../deserializer/source').RepositoryCitation} RepositoryCitation
 * @typedef {import('./types.ts').RepositoryLD} RepositoryLD
 */

/**
 * Repository property converter
 * @type {import('./types.ts').Converter<RepositoryLD>}
 * @param {Repository|RepositoryCitation} obj The data object to transform
 * @returns {import('./types.ts').RepositoryLD} The conversion result
 */

export const converter = (obj) => {
	const value = createObject(schema);
	value.type = schema.TYPES.ARCHIVE_ORGANIZATION;
	let errors;
	let map;
	if (!obj['@value']) {
		// Repository record
		const record = /** @type {Repository} */ (obj);
		map = {
			RIN: (val) => (value.identifier = val),
			NAME: (val) => (value.name = val),
			ADDR: (val) => (value.address = val),
			PHON: (val) => (value.telephone = val),
			FAX: (val) => (value.faxNumber = val),
			EMAIL: (val) => (value.email = val),
			WWW: (val) => (value.url = val),
			REFN: (val) => {
				value.context.addVocabulary(rdfs);
				value['@id'] = val['@value'];
				if (val.TYPE) value[`${rdfs.PREFIX}:comment`] = val.TYPE;
			},
			CHAN: (val) => (value.dateModified = dateConverter(val.DATE).value),
		};
		errors = mapObject(record, map);
	} else {
		// Repository citation
		const citation = /** @type {RepositoryCitation} */ (obj);
		map = {
			'@value': (val) => (value['@id'] = val),
			'CALN': (val) => (value.identifier = val['@value']),
		};
		errors = mapObject(citation, map);
	}
	const error = Object.keys(errors).length && new Error(`The following properties conversion fail: ${Object.keys(errors).join(', ')}`);
	const ignore = Object.keys(obj).filter((name) => !map[name]);
	const warn = ignore.length && `The ${ignore.join(', ')} properties were not converted for ${obj['@type']} object`;
	return { value, ...(warn && { warn }), ...(error && { error }) };
};

/**
 * Repository obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[REPOSITORY, converter]]);
