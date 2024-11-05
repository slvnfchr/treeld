import { SOURCE } from '../gedcom.js';
import { createObject, schema, rdfs } from './context.js';
import { mapObject } from './utils.js';
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
 * @returns {import('./types.ts').ConversionResult<SourceLD>} The conversion result
 */

const converter = (obj) => {
	const value = createObject(schema);
	value.type = schema.TYPES.ARCHIVE;
	let errors;
	let map;
	if (!obj['@value']) {
		// Source record
		const record = /** @type {Source} */ (obj);
		map = {
			RIN: (val) => (value.identifier = val),
			AUTH: (val) => (value.author = val),
			TITL: (val) => (value.name = val),
			ABBR: (val) => (value.alternateName = val), // Short title or reference
			PUBL: (val) => (value.publisher = val), // Publication information
			TEXT: (val) => (value.description = val), // Verbatim
			REPO: (val) => (value.holdingArchive = val), // Repository
			// User-defined number or text that the submitter uses to identify this record
			REFN: (val) => {
				value.context.addVocabulary(rdfs);
				value['@id'] = val['@value'];
				if (val.TYPE) value[`${rdfs.PREFIX}:comment`] = val.TYPE;
			},
			CHAN: (val) => (value.dateModified = dateConverter(val.DATE).value),
		};
		errors = mapObject(record, map);
	} else {
		// Source citation
		const citation = /** @type {SourceCitation} */ (obj);
		map = {
			'@value': (val) => (value.sameAs = val),
			'PAGE': (val) => (value.description = val),
			'QUAY': (val) => {
				value.context.addVocabulary(rdfs);
				value[`${rdfs.PREFIX}:comment`] = val;
			},
			'DATA': (val) => {
				value.dateCreated = dateConverter(val.DATE).value;
				value.abstract = val.TEXT;
			},
		};
		errors = mapObject(citation, map);
	}
	const error = Object.keys(errors).length && new Error(`The following properties conversion fail: ${Object.keys(errors).join(', ')}`);
	const ignore = Object.keys(obj).filter((name) => !map[name]);
	const warn = ignore.length && `The ${ignore.join(', ')} properties were not converted for ${obj['@type']} object`;
	return { value, ...(warn && { warn }), ...(error && { error }) };
};

/**
 * Events obj converter
 * @type {import('./types.js').ConversionMap}
 * @instance
 */

export default new Map([[SOURCE, converter]]);
