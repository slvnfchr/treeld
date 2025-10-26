import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { SOURCE, SHARED_NOTE, QUALITY } from '../gedcom/constants.js';
import { isObject, schema, rdfs, skos } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Source citation', async () => {
		const id = 'ID of source';
		const page = 'Location in source';
		const quality = 2;
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
			expect(obj).to.have.all.keys('@context', '@type', 'isPartOf', 'description', 'dateCreated', 'abstract', `${rdfs.PREFIX}:comment`);
			expect(obj.isPartOf).to.equal(id);
			expect(obj.description).to.equal(page);
			expect(obj.dateCreated).to.equal('1791-12-26');
			expect(obj.abstract).to.equal(text);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(QUALITY[quality]);
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
		const creationDate = '26 DEC 1791';
		const modificationDate = '13 MAY 2020';
		const modificationTime = '18:30:00';
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
			'CREA': { DATE: creationDate },
			'CHAN': { DATE: { '@value': modificationDate, 'TIME': modificationTime } },
			'REFN': { '@value': identifier, 'TYPE': identifierType },
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ARCHIVE)).to.be.true;
			expect(obj).to.have.all.keys(
				'@context',
				'@id',
				'@type',
				'identifier',
				'author',
				'name',
				'alternateName',
				'publisher',
				'description',
				'holdingArchive',
				'dateCreated',
				'dateModified',
				'rdfs:comment',
			);
			expect(obj['@id']).to.equal(identifier);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(identifierType);
			expect(obj.identifier).to.equal(reference);
			expect(obj.author).to.equal(author);
			expect(obj.name).to.equal(title);
			expect(obj.alternateName).to.equal(alternative);
			expect(obj.publisher).to.equal(publication);
			expect(obj.description).to.equal(citation);
			expect(obj.holdingArchive).to.equal(repository);
			expect(obj.dateCreated).to.equal('1791-12-26');
			expect(obj.dateModified).to.equal('2020-05-13T18:30:00.000Z');
		}
	});

	it('Source record with simple note should be converted to ArchiveComponent with a comment property', async () => {
		const note = 'Taken during summer vacation';
		const src = { '@type': SOURCE, 'NOTE': note };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property(`${rdfs.PREFIX}:comment`, note);
		}
	});

	it('Source record with shared note should be converted to ArchiveComponent with a note property', async () => {
		const id = '@ID@';
		const note = 'Taken during summer vacation';
		const data = createStreamFromObject([
			{ '@ref': id, '@type': SHARED_NOTE, '@value': note },
			{ '@type': SOURCE, [SHARED_NOTE]: id },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [sharedNote, source] = await converter.chunks();
		expect(source).to.have.property(`${skos.PREFIX}:note`);
		expect(isObject(source[`${skos.PREFIX}:note`], schema.TYPES.CREATIVE_WORK)).to.be.true;
		expect(source[`${skos.PREFIX}:note`]).to.equal(sharedNote);
	});
};
