import { SOURCE } from '../gedcom.js';
import { createObject, mapProperties, dc, dcmitype, rdfs } from './context.js';
import { renameProperty } from './utils.js';
import { parse as parseDate } from './date/index.js';

/**
 * Create custom type
 * @function createMediaType
 * @param {Object} properties Media type properties object
 * @returns {Object} The JSON-LD media type object
 * @private
 */

const createMediaType = (properties) => {
	const type = createObject(rdfs, properties);
	type.context.setDefault(dcmitype);
	return type;
};

/**
 * GEDCOM sources media types
 * @private
 */

export const MEDIA_TYPES = new Map([
	['AUDIO', dcmitype.TYPES.SOUND],
	[
		'BOOK',
		createMediaType({
			'@id': dcmitype.TYPES.TEXT,
			'comment': 'book',
		}),
	],
	[
		'CARD',
		createMediaType({
			'@id': dcmitype.TYPES.IMAGE_STILL,
			'comment': 'card',
		}),
	],
	[
		'ELECTRONIC',
		createMediaType({
			'@id': dcmitype.TYPES.INTERACTIVE,
			'comment': 'electronic',
		}),
	],
	[
		'FICHE',
		createMediaType({
			'@id': dcmitype.TYPES.TEXT,
			'comment': 'fiche',
		}),
	],
	[
		'FILM',
		createMediaType({
			'@id': dcmitype.TYPES.IMAGE_MOVING,
			'comment': 'film',
		}),
	],
	[
		'MAGAZINE',
		createMediaType({
			'@id': dcmitype.TYPES.TEXT,
			'comment': 'magazine',
		}),
	],
	[
		'MANUSCRIPT',
		createMediaType({
			'@id': dcmitype.TYPES.TEXT,
			'comment': 'manuscript',
		}),
	],
	[
		'MAP',
		createMediaType({
			'@id': dcmitype.TYPES.IMAGE_STILL,
			'comment': 'map',
		}),
	],
	[
		'NEWSPAPER',
		createMediaType({
			'@id': dcmitype.TYPES.TEXT,
			'comment': 'newspaper',
		}),
	],
	[
		'PHOTO',
		createMediaType({
			'@id': dcmitype.TYPES.IMAGE_STILL,
			'comment': 'photo',
		}),
	],
	[
		'TOMBSTONE',
		createMediaType({
			'@id': dcmitype.TYPES.PHYSICAL_OBJECT,
			'comment': 'tombstone',
		}),
	],
	[
		'VIDEO',
		createMediaType({
			'@id': dcmitype.TYPES.IMAGE_MOVING,
			'comment': 'video',
		}),
	],
]);

/**
 * Source object converter
 * @type {Function}
 * @param {Object} obj The data object to transform
 * @returns {Object} The converted data object
 */

const converter = (obj) => {
	const source = createObject(dc);
	if (!obj['@value']) {
		// Source record
		source.context.add(dcmitype);
		source['@type'] = `${dcmitype.PREFIX}:${dcmitype.TYPES.TEXT}`;
		mapProperties(obj, source, {
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
		if (obj.CHAN) {
			source.modified = typeof obj.CHAN === 'string' ? parseDate(obj.CHAN).toISOString() : obj.CHAN.DATE;
		}
		// TODO: handle event citation
	} else {
		// Source citation
		source.context.add(dcmitype);
		source['@type'] = `${dcmitype.PREFIX}:${dcmitype.TYPES.TEXT}`;
		mapProperties(obj, source, {
			'@value': 'isPartOf',
			'PAGE': 'description',
			'QUAY': { comment: rdfs },
		});
		if (obj.DATA) {
			source.created = typeof obj.DATE === 'string' ? parseDate(obj.DATA.DATE).toISOString() : obj.DATA.DATE;
			source.abstract = obj.DATA.TEXT;
		}

		// TODO: handle event citation
	}
	return source;
};

/**
 * Events obj converter
 * @type {Map}
 * @instance
 */

export default new Map([[SOURCE, converter]]);
