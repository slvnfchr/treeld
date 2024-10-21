import { createObject, mapProperties, schema, rdfs } from './context.js';
import { REPOSITORY } from '../gedcom.js';
import { converter as dateConverter } from './date.js';

/**
 * Repository property converter
 * @type {Function}
 * @param {import('../deserializer').Chunk|string} obj The repository object or string to transform
 * @returns {import('./repository').Repository} The converted data object
 */

export const converter = (obj) => {
	let repository;
	if (typeof obj === 'string') {
		repository = converter({ '@value': obj });
	} else if (!obj['@value']) {
		// Repository record
		repository = createObject(schema);
		repository.type = schema.TYPES.ARCHIVE_ORGANIZATION;
		mapProperties(obj, repository, {
			RIN: 'identifier',
			NAME: 'name',
			ADDR: 'address',
			PHON: 'telephone',
			FAX: 'faxNumber',
			EMAIL: 'email',
			WWW: 'url',
		});
		if (obj.REFN && obj.REFN.TYPE) {
			repository.context.add(rdfs);
			repository['@id'] = obj.REFN['@value'];
			repository[`${rdfs.PREFIX}:comment`] = obj.REFN.TYPE;
		}
		// Change date
		if (obj.CHAN) {
			repository.dateModified = dateConverter(obj.CHAN.DATE);
		}
	} else if (obj.CALN) {
		// Repository citation
		repository = createObject(schema);
		repository.type = schema.TYPES.ARCHIVE_ORGANIZATION;
		repository['@id'] = obj['@value'];
		repository.identifier = obj.CALN['@value'];
	}
	return repository;
};

/**
 * Repository obj converter
 * @type {Map}
 * @instance
 */

export default new Map([[REPOSITORY, converter]]);
