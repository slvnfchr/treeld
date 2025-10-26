import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { isObject, schema } from './context.js';
import { SHARED_NOTE } from '../gedcom/constants.js';
import Converter from '../converter.js';

export default () => {
	it('Shared note record should be converted to PostalAddress schema.org object', async () => {
		const text = 'Note content';
		const mimetype = 'text/plain';
		const language = 'French';
		const translation = 'Note translation';
		const anotherLanguage = 'French';
		const src = {
			'@type': SHARED_NOTE,
			'@value': text,
			'MIME': mimetype,
			'LANG': language,
			'TRAN': {
				'@value': translation,
				'MIME': mimetype,
				'LANG': anotherLanguage,
			},
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.CREATIVE_WORK)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'text', 'encodingFormat', 'inLanguage', 'workTranslation');
			expect(obj.text).to.equal(text);
			expect(obj.encodingFormat).to.equal(mimetype);
			expect(obj.inLanguage).to.equal(language);
			expect(isObject(obj.workTranslation, schema.TYPES.CREATIVE_WORK)).to.be.true;
			expect(obj.workTranslation.text).to.equal(translation);
			expect(obj.workTranslation.encodingFormat).to.equal(mimetype);
			expect(obj.workTranslation.language).to.equal(anotherLanguage);
		}
	});
};
