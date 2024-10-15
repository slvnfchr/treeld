import { createObject, mapProperties, dc, schema, rdfs } from './context.js';
import { REPOSITORY } from '../gedcom.js';
import { MEDIA_TYPES } from './source.js';
import { parse as parseDate } from './date/index.js';

/**
 * Repository property converter
 * @type {Function}
 * @param {Object} obj The repository object to transform
 * @returns {Object} The converted data object
 */

const converter = (obj) => {
	let repository;
	if (!obj['@value']) {
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
			repository.modified = typeof obj.CHAN === 'string' ? parseDate(obj.CHAN).toISOString() : obj.CHAN.DATE;
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
	} else {
		obj['@parent'].publisher = obj['@value'];
	}
	return repository;
};

/**
 * Repository obj converter
 * @type {Map}
 * @instance
 */

export default new Map([[REPOSITORY, converter]]);
