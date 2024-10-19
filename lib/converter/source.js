import { SOURCE } from '../gedcom.js';
import { createObject, mapProperties, dc, schema, rdfs } from './context.js';
import { converter as dateConverter } from './date.js';

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
		source.context.add(schema);
		source['@type'] = `${schema.PREFIX}:${schema.TYPES.ARCHIVE}`;
		mapProperties(obj, source, {
			RIN: 'identifier',
			AUTH: 'author',
			TITL: 'name',
			ABBR: 'alternateName', // Short title or reference
			PUBL: 'publisher', // Publication information
			TEXT: 'description', // Verbatim
			REPO: 'holdingArchive', // Repository
		});
		// User-defined number or text that the submitter uses to identify this record
		if (obj.REFN) {
			source.context.add(rdfs);
			source['@id'] = obj.REFN['@value'];
			source[`${rdfs.PREFIX}:comment`] = obj.REFN.TYPE;
		}
		// Change date
		if (obj.CHAN) {
			source.dateModified = dateConverter(obj.CHAN.DATE);
		}
		// TODO: handle event citation
	} else {
		// Source citation
		source.context.add(schema);
		source['@type'] = `${schema.PREFIX}:${schema.TYPES.ARCHIVE}`;
		mapProperties(obj, source, {
			'@value': 'sameAs',
			'PAGE': 'description',
			'QUAY': { comment: rdfs },
		});
		if (obj.DATA) {
			source.dateCreated = dateConverter(obj.DATA.DATE);
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
