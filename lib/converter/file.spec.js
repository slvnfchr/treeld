import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { FILE } from '../gedcom/constants.js';
import { isObject, schema } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('File reference should be converted to MediaObject schema.org object', async () => {
		const filePath = 'document.pdf';
		const mimetype = 'application/pdf';
		const src = {
			'@type': FILE,
			'@value': filePath,
			'FORM': mimetype,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.MEDIA)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'contentUrl', 'encodingFormat');
			expect(obj).to.have.property('contentUrl', filePath);
			expect(obj).to.have.property('encodingFormat', mimetype);
		}
	});

	it('File reference with title should be converted to MediaObject object with name property', async () => {
		const title = 'Family Document';
		const src = {
			'@type': FILE,
			'@value': 'document.jpg',
			'TITL': title,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('name', title);
		}
	});

	it('File reference with translation should be converted to MediaObject with workTranslation property', async () => {
		const filePath = 'translated.txt';
		const mimetype = 'text/plain';
		const src = {
			'@type': FILE,
			'@value': 'text.txt',
			'TRAN': {
				'@value': filePath,
				'FORM': mimetype,
			},
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.MEDIA)).to.be.true;
			expect(obj).to.have.property('workTranslation');
			expect(obj.workTranslation).to.have.property('contentUrl', filePath);
			expect(obj.workTranslation).to.have.property('encodingFormat', mimetype);
		}
	});
};
