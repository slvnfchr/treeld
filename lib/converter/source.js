import { SOURCE } from '../gedcom.js';
import { createObject, mapProperties, schema, rdfs } from './context.js';
import { converter as dateConverter } from './date.js';

/**
 * @typedef {import('../deserializer/source').Source} Source
 * @typedef {import('../deserializer/source').SourceCitation} SourceCitation
 * @typedef {import('./types.ts').SourceLD} SourceLD
 */

/**
 * Source object converter
 * @type {import('./types.ts').Converter<SourceLD>}
 * @param {Source|SourceCitation} obj The data object to transform
 * @returns {import('./types.ts').SourceLD} The converted data object
 */

const converter = (obj) => {
	let source;
	if (!obj['@value']) {
		// Source record
		const record = /** @type {Source} */ (obj);
		source = createObject(schema);
		source.type = schema.TYPES.ARCHIVE;
		mapProperties(record, source, {
			RIN: 'identifier',
			AUTH: 'author',
			TITL: 'name',
			ABBR: 'alternateName', // Short title or reference
			PUBL: 'publisher', // Publication information
			TEXT: 'description', // Verbatim
			REPO: 'holdingArchive', // Repository
		});
		// User-defined number or text that the submitter uses to identify this record
		if (record.REFN) {
			source.context.addVocabulary(rdfs);
			source['@id'] = record.REFN['@value'];
			if (record.REFN.TYPE) source[`${rdfs.PREFIX}:comment`] = record.REFN.TYPE;
		}
		// Change date
		if (record.CHAN) {
			source.dateModified = dateConverter(record.CHAN.DATE);
		}
		// TODO: handle event citation
	} else {
		// Source citation
		const citation = /** @type {SourceCitation} */ (obj);
		source = createObject(schema);
		source.type = schema.TYPES.ARCHIVE;
		mapProperties(citation, source, {
			'@value': 'sameAs',
			'PAGE': 'description',
			'QUAY': { comment: rdfs },
		});
		if (citation.DATA) {
			source.dateCreated = dateConverter(citation.DATA.DATE);
			source.abstract = citation.DATA.TEXT;
		}
		// TODO: handle event citation
	}
	return source;
};

/**
 * Events obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[SOURCE, converter]]);
