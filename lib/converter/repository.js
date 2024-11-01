import { createObject, mapProperties, schema, rdfs } from './context.js';
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
 * @returns {import('./types.ts').RepositoryLD} The converted data object
 */

export const converter = (obj) => {
	let repository;
	if (!obj['@value']) {
		// Repository record
		const record = /** @type {Repository} */ (obj);
		repository = createObject(schema);
		repository.type = schema.TYPES.ARCHIVE_ORGANIZATION;
		mapProperties(record, repository, {
			RIN: 'identifier',
			NAME: 'name',
			ADDR: 'address',
			PHON: 'telephone',
			FAX: 'faxNumber',
			EMAIL: 'email',
			WWW: 'url',
		});
		if (record.REFN && record.REFN.TYPE) {
			repository.context.addVocabulary(rdfs);
			repository['@id'] = record.REFN['@value'];
			repository[`${rdfs.PREFIX}:comment`] = record.REFN.TYPE;
		}
		// Change date
		if (record.CHAN) {
			repository.dateModified = dateConverter(record.CHAN.DATE);
		}
	} else {
		// Repository citation
		const citation = /** @type {RepositoryCitation} */ (obj);
		repository = createObject(schema);
		repository.type = schema.TYPES.ARCHIVE_ORGANIZATION;
		repository['@id'] = citation['@value'];
		if (citation.CALN) repository.identifier = citation.CALN['@value'];
	}
	return repository;
};

/**
 * Repository obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[REPOSITORY, converter]]);
