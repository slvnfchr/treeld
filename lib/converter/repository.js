import { createObject, mapProperties, dc, schema, rdfs } from './context.js';
import { REPOSITORY } from '../gedcom.js';
import { MEDIA_TYPES } from './source.js';
import { converter as dateConverter } from './date.js';

/**
 * Repository property converter
 * @type {Function}
 * @param {Object|string} obj The repository object or string to transform
 * @returns {Object} The converted data object
 */

export const converter = (obj) => {
	let repository;
	if (typeof obj === 'string') {
		repository = converter({ '@value': obj });
	} else if (!obj['@value']) {
		// Repository record
		repository = createObject(schema);
		repository.type = schema.TYPES.ORGANIZATION;
		mapProperties(obj, repository, {
			RIN: '@id', // Automated record ID
			NAME: 'name',
			ADDR: 'address',
			PHON: 'telephone',
			FAX: 'faxNumber',
			EMAIL: 'email',
			WWW: 'url',
		});
		if (obj.REFN && obj.REFN.TYPE) {
			repository.context.add(rdfs);
			repository.identifier = {
				'@value': obj.REFN['@value'],
				[`${rdfs.PREFIX}:comment`]: obj.REFN.TYPE,
			};
		}
		// Change date
		if (obj.CHAN) {
			repository.modified = dateConverter(obj.CHAN.DATE);
		}
	} else if (obj.CALN) {
		// Full repository citation
		repository = createObject(dc);
		repository.publisher = obj['@value'];
		repository.identifier = obj.CALN['@value'];
		const type = Array.from(MEDIA_TYPES.keys()).find((key) => new RegExp(key, 'i').test(obj.CALN.MEDI));
		if (type) {
			repository.type = MEDIA_TYPES.get(type);
		} else {
			repository.format = obj.CALN.MEDI;
		}
	}
	return repository;
};

/**
 * Repository obj converter
 * @type {Map}
 * @instance
 */

export default new Map([[REPOSITORY, converter]]);
