import { createObject, mapProperties, flatten, dc, dcmitype, rdfs } from './context';
import { renameProperty } from './utils';

/**
 * GEDCOM sources media types
 * @private
 */

export const MEDIA_TYPES = {
	AUDIO: dcmitype.TYPES.SOUND,
	BOOK: {
		'@id': dcmitype.TYPES.TEXT,
		'comment': 'book',
	},
	CARD: {
		'@id': dcmitype.TYPES.IMAGE_STILL,
		'comment': 'card',
	},
	ELECTRONIC: {
		'@id': dcmitype.TYPES.INTERACTIVE,
		'comment': 'electronic',
	},
	FICHE: {
		'@id': dcmitype.TYPES.TEXT,
		'comment': 'fiche',
	},
	FILM: {
		'@id': dcmitype.TYPES.IMAGE_MOVING,
		'comment': 'film',
	},
	MAGAZINE: {
		'@id': dcmitype.TYPES.TEXT,
		'comment': 'magazine',
	},
	MANUSCRIPT: {
		'@id': dcmitype.TYPES.TEXT,
		'comment': 'manuscript',
	},
	MAP: {
		'@id': dcmitype.TYPES.IMAGE_STILL,
		'comment': 'map',
	},
	NEWSPAPER: {
		'@id': dcmitype.TYPES.TEXT,
		'comment': 'newspaper',
	},
	PHOTO: {
		'@id': dcmitype.TYPES.IMAGE_STILL,
		'comment': 'photo',
	},
	TOMBSTONE: {
		'@id': dcmitype.TYPES.PHYSICAL_OBJECT,
		'comment': 'tombstone',
	},
	VIDEO: {
		'@id': dcmitype.TYPES.IMAGE_MOVING,
		'comment': 'video',
	},
};
Object.values(MEDIA_TYPES)
	.filter((type) => typeof type !== 'string')
	.forEach((type) => {
		createObject(rdfs, type);
		type.context.setDefault(dcmitype);
	});

/**
 * Source (sub)record transformer
 * @type {Function}
 * @param {Object} data The data object to transform
 * @param {String} property The target object property to transform
 * @returns {Object} The data object with the transformed property if applicable
 * @instance
 */

export default (data, property) => {
	if (property === 'SOUR') {
		const isRecord = data[property] === undefined;
		let source = data[property] || data;
		source = createObject(dc, source);
		if (isRecord) {
			// Source record
			source.context.add(dcmitype);
			Object.assign(source, { '@type': `${dcmitype.PREFIX}:${dcmitype.TYPES.TEXT}` });
			mapProperties(source, {
				RIN: '@id',
				DATA: 'references',
				AUTH: 'author',
				TITL: 'title',
				ABBR: 'alternative', // Short title or reference
				PUBL: 'publisher', // Publication information
				TEXT: 'description', // Verbatim
				REFN: 'identifier', // A user-defined number or text that the submitter uses to identify this record
			});
			if (source.identifier && source.identifier.TYPE) {
				source.context.add(rdfs);
				renameProperty(source.identifier, 'TYPE', `${rdfs.PREFIX}:comment`);
			}
			// Change date
			if (source.CHAN) {
				Object.assign(source, { CHAN: source.CHAN.DATE });
				renameProperty(source, 'CHAN', 'modified');
			}
			// TODO: handle event citation
		} else {
			// Source citation
			flatten(source, 'DATA');
			source.context.add(dcmitype);
			Object.assign(source, { '@type': `${dcmitype.PREFIX}:${dcmitype.TYPES.TEXT}` });
			mapProperties(source, {
				'@id': 'isPartOf',
				'PAGE': 'description',
				'DATE': 'created',
				'TEXT': 'abstract',
				'QUAY': { comment: rdfs },
			});
			// TODO: handle event citation
		}
		return source;
	}
	return data[property] || data;
};
