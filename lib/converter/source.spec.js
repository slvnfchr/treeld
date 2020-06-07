
import { createStreamFromObject } from '../utils/stream';
import { isObject, dc, dcmitype, rdfs } from './context';
import Converter from '../converter';

export default () => {

	it('Source citation', (done) => {
		const id = 'ID of source';
		const page = 'Location in source';
		const quality = 'Certainty assessment of source';
		const date = '26 DEC 1791';
		const text = 'Text from source';
		const source = {
			'@id': id,
			PAGE: page,
			DATA: { DATE: date, TEXT: text },
			QUAY: quality,
		};
		const data = createStreamFromObject([
			{ property: 'DATE', data: source.DATA },
			{ data: { SOUR: source } },
		]);
		const converter = new Converter();
		let chunk = 0;
		const onData = spy(({ data: { SOUR: obj } }) => {
			if (chunk === 1) {
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@type', 'isPartOf', 'description', 'created', 'abstract', `${rdfs.PREFIX}:comment`);
				expect(obj['@type']).to.equal(`${dcmitype.PREFIX}:${dcmitype.TYPES.TEXT}`);
				expect(obj.isPartOf).to.equal(id);
				expect(obj.description).to.equal(page);
				expect(obj.created).to.equal('1791-12-26');
				expect(obj.abstract).to.equal(text);
				expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(quality);
			}
			chunk += 1;
		});
		converter.on('data', onData);
		converter.on('end', done);
		data.pipe(converter);
	});

	it('Source record', (done) => {
		const id = 'ID of source';
		const author = 'Author of source';
		const title = 'Title of source';
		const alternative = 'Short title';
		const publication = 'Source publication facts';
		const citation = 'Citation from source';
		const date = '26 DEC 1791';
		const time = '18:30:00';
		const identifier = 'Source reference';
		const identifierType = 'Source reference type';
		const source = {
			RIN: id,
			TITL: title,
			AUTH: author,
			ABBR: alternative,
			PUBL: publication,
			TEXT: citation,
			CHAN: { DATE: { '@value': date, TIME: time } },
			REFN: { '@value': identifier, TYPE: identifierType },
		};
		const data = createStreamFromObject([
			{ property: 'DATE', data: source.CHAN },
			{ type: 'SOUR', data: source },
		]);
		const converter = new Converter();
		let chunk = 0;
		const onData = spy(({ data: obj }) => {
			if (chunk === 1) {
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@id', '@type', 'author', 'title', 'alternative', 'publisher', 'description', 'modified', 'identifier');
				expect(obj['@id']).to.equal(id);
				expect(obj['@type']).to.equal(`${dcmitype.PREFIX}:${dcmitype.TYPES.TEXT}`);
				expect(obj.author).to.equal(author);
				expect(obj.title).to.equal(title);
				expect(obj.alternative).to.equal(alternative);
				expect(obj.publisher).to.equal(publication);
				expect(obj.description).to.equal(citation);
				expect(obj.modified).to.equal('1791-12-26T18:30:00.000Z');
				expect(obj.identifier['@value']).to.equal(identifier);
				expect(obj.identifier[`${rdfs.PREFIX}:comment`]).to.equal(identifierType);
			}
			chunk += 1;
		});
		converter.on('data', onData);
		converter.on('end', done);
		data.pipe(converter);
	});

};
