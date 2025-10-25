import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { MULTIMEDIA, RESTRICTION } from '../gedcom/constants.js';
import { isObject, schema, rdfs } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Multimedia record should be converted to DigitalDocument schema.org object', async () => {
		const src = { '@type': MULTIMEDIA };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.DIGITAL_DOCUMENT)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type');
		}
	});

	it('Multimedia record with simple file reference should be converted to DigitalDocument with associatedMedia property', async () => {
		const file = 'photo.jpg';
		const src = {
			'@type': MULTIMEDIA,
			'FILE': file,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('associatedMedia');
			expect(isObject(obj.associatedMedia, schema.TYPES.MEDIA)).to.be.true;
			expect(obj.associatedMedia).to.have.property('contentUrl', file);
		}
	});

	it('Multimedia record with full file reference should be converted to DigitalDocument with associatedMedia property', async () => {
		const filePath = 'photo.jpg';
		const mimetype = 'image/jpeg';
		const src = {
			'@type': MULTIMEDIA,
			'FILE': {
				'@type': 'FILE',
				'@value': filePath,
				'FORM': mimetype,
			},
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('associatedMedia');
			expect(isObject(obj.associatedMedia, schema.TYPES.MEDIA)).to.be.true;
			expect(obj.associatedMedia).to.have.property('contentUrl', filePath);
			expect(obj.associatedMedia).to.have.property('encodingFormat', mimetype);
		}
	});

	it('Multimedia record with note should be converted to DigitalDocument with a comment property', async () => {
		const note = 'Taken during summer vacation';
		const src = {
			'@type': MULTIMEDIA,
			'NOTE': { NOTE: note },
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property(`${rdfs.PREFIX}:comment`, note);
		}
	});

	it('Multimedia record with restriction should be converted to DigitalDocument with a conditionsOfAccess property', async () => {
		const src = {
			'@type': MULTIMEDIA,
			'RESN': RESTRICTION.CONFIDENTIAL,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('conditionsOfAccess', RESTRICTION.CONFIDENTIAL);
		}
	});

	it('Multimedia record with creation and change dates should be converted to DigitalDocument with expected properties', async () => {
		const creationDate = '12 SEP 2016';
		const creationTime = '09:50:00';
		const modificationDate = '13 MAY 2020';
		const modificationTime = '18:30:00';
		const src = {
			'@type': MULTIMEDIA,
			'CREA': { DATE: { '@value': creationDate, 'TIME': creationTime } },
			'CHAN': { DATE: { '@value': modificationDate, 'TIME': modificationTime } },
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.dateCreated).to.equal('2016-09-12T09:50:00.000Z');
			expect(obj.dateModified).to.equal('2020-05-13T18:30:00.000Z');
		}
	});

	it('Multimedia link should be converted to DigitalDocument with expected properties', async () => {
		const id = '@ID@';
		const title = 'Title of document';
		const data = createStreamFromObject([
			{ '@type': MULTIMEDIA, '@ref': id, 'FILE': 'note.txt' },
			{ '@type': MULTIMEDIA, '@value': id, 'TITL': title },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [record, link] = await converter.chunks();
		expect(isObject(link, schema.TYPES.DIGITAL_DOCUMENT)).to.be.true;
		expect(link).to.have.all.keys('@context', '@type', 'sameAs', 'name');
		expect(link.name).to.equal(title);
		expect(link.sameAs).to.equal(record);
	});
};
