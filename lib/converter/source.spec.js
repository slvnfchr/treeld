import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { SOURCE } from '../gedcom.js';
import { isObject, schema, rdfs } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Source citation', async () => {
		const id = 'ID of source';
		const page = 'Location in source';
		const quality = 'Certainty assessment of source';
		const date = '26 DEC 1791';
		const text = 'Text from source';
		const src = {
			'@type': SOURCE,
			'@value': id,
			'PAGE': page,
			'DATA': { DATE: date, TEXT: text },
			'QUAY': quality,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ARCHIVE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'sameAs', 'description', 'dateCreated', 'abstract', `${rdfs.PREFIX}:comment`);
			expect(obj.sameAs).to.equal(id);
			expect(obj.description).to.equal(page);
			expect(obj.dateCreated).to.equal('1791-12-26');
			expect(obj.abstract).to.equal(text);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(quality);
		}
	});

	it('Source record', async () => {
		const reference = 'ID of source';
		const author = 'Author of source';
		const title = 'Title of source';
		const alternative = 'Short title';
		const publication = 'Source publication facts';
		const citation = 'Citation from source';
		const repository = 'ID of repository';
		const date = '26 DEC 1791';
		const time = '18:30:00';
		const identifier = 'Source reference';
		const identifierType = 'Source reference type';
		const src = {
			'@type': SOURCE,
			'RIN': reference,
			'TITL': title,
			'AUTH': author,
			'ABBR': alternative,
			'PUBL': publication,
			'TEXT': citation,
			'REPO': repository,
			'CHAN': { DATE: { '@value': date, 'TIME': time } },
			'REFN': { '@value': identifier, 'TYPE': identifierType },
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ARCHIVE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@id', '@type', 'identifier', 'author', 'name', 'alternateName', 'publisher', 'description', 'holdingArchive', 'dateModified', 'rdfs:comment');
			expect(obj['@id']).to.equal(identifier);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(identifierType);
			expect(obj.identifier).to.equal(reference);
			expect(obj.author).to.equal(author);
			expect(obj.name).to.equal(title);
			expect(obj.alternateName).to.equal(alternative);
			expect(obj.publisher).to.equal(publication);
			expect(obj.description).to.equal(citation);
			expect(obj.holdingArchive).to.equal(repository);
			expect(obj.dateModified).to.equal('1791-12-26T18:30:00.000Z');
		}
	});
};
