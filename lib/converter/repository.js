import { createObject, schema, rdfs } from './context.js';
import { mapObject, noop } from './utils.js';
import { REPOSITORY } from '../gedcom/constants.js';
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
	let results;
	if (!obj['@value']) {
		// Repository record
		const record = /** @type {Repository} */ (obj);
		const map = {
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
		results = mapObject(record, map);
	} else {
		// Repository citation
		const citation = /** @type {RepositoryCitation} */ (obj);
		const map = {
			'@value': (val) => (value['@id'] = val),
			'CALN': (val) => (value.identifier = val['@value'] || val),
		};
		results = mapObject(citation, map);
	}
	return { value, ...results };
};

/**
 * Repository obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([
	[REPOSITORY, converter],
	['CALN', noop],
]);
