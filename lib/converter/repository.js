import { createObject, mapProperties, dc, schema, rdfs } from './context';
import { renameProperty } from './utils';
import { MEDIA_TYPES } from './source';

/**
 * Repository (sub)records transformer
 * @type {Function}
 * @param {Object} data The data object to transform
 * @param {String} property The target object property to transform
 * @param {Transform} stream The transform stream from which transformer is called to emit additional chunk if needed
 * @returns {Object} The data object with the transformed property if applicable
 * @instance
 */

export default (data, property) => {
	if (property === 'REPO') {
		const isRecord = data[property] === undefined;
		let repository = data[property] || data;
		if (isRecord) {
			// Repository record
			repository = createObject(schema, repository);
			repository.type = schema.TYPES.ORGANIZATION;
			mapProperties(repository, {
				RIN: '@id', // Automated record ID
				NAME: 'name',
				REFN: 'identifier',
				ADDR: 'address',
				PHON: 'telephone',
				FAX: 'faxNumber',
				EMAIL: 'email',
				WWW: 'url',
			});
			if (repository.identifier && repository.identifier.TYPE) {
				repository.context.add(rdfs);
				renameProperty(repository.identifier, 'TYPE', `${rdfs.PREFIX}:comment`);
			}
			// Change date
			if (repository.CHAN) {
				Object.assign(repository, { CHAN: repository.CHAN.DATE });
				renameProperty(repository, 'CHAN', 'modified');
			}
		} else if (repository.CALN) {
			// Full repository citation
			repository = createObject(dc, repository);
			Object.assign(repository, { CALN: repository.CALN['@value'], MEDI: repository.CALN.MEDI }); // Flatten
			const type = Object.keys(MEDIA_TYPES).find((key) => new RegExp(key, 'i').test(repository.MEDI));
			if (type) {
				Object.assign(repository, { MEDI: MEDIA_TYPES[type] });
				renameProperty(repository, 'MEDI', 'type');
			} else {
				renameProperty(repository, 'MEDI', 'format');
			}
			renameProperty(repository, 'CALN', 'identifier');
			renameProperty(repository, '@id', 'publisher');
			renameProperty(data, property, 'source');
		} else {
			Object.assign(data, { [property]: data[property]['@id'] });
			renameProperty(data, property, 'publisher');
		}
		return repository;
	}
	return data[property] || data;
};
