import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { isObject, bio, rdfs } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Event attribute with known type should be converted to a JSON-LD objet with corresponding type', (t, done) => {
		const date = '26 DEC 1791';
		const place = 'London, United Kingdom';
		const event = { DATE: date, PLAC: place };
		const data = createStreamFromObject({ data: { BIRT: event } });
		const converter = new Converter();
		const onData = spy(({ data: { BIRT: obj } }) => {
			expect(obj).to.equal(event);
			expect(isObject(obj, bio.TYPES.BIRTH)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'date', 'place');
			expect(obj.date).to.equal(date);
			expect(obj.place).to.equal(place);
		});
		converter.on('data', onData);
		converter.on('end', done);
		data.pipe(converter);
	});

	it('Event attribute with unknown type should be converted to a JSON-LD objet with additional type annotation', (t, done) => {
		const date = '1841';
		const place = 'London, United Kingdom';
		const event = { DATE: date, PLAC: place };
		const data = createStreamFromObject({ data: { CENS: event } });
		const converter = new Converter();
		const onData = spy(({ data: obj }) => {
			if (obj.CENS) {
				expect(obj.CENS).to.equal(event);
				expect(isObject(obj.CENS)).to.be.true;
				expect(obj.CENS).to.have.all.keys('@context', '@type', 'date', 'place');
				expect(obj.CENS['@type']).to.match(/^#/i);
			} else {
				// Additional stream chunk for event type
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@id', '@type', 'rdfs:label', 'rdfs:comment');
			}
		});
		converter.on('data', onData);
		converter.on('end', () => {
			expect(onData).to.have.been.called.exactly(2);
			done();
		});
		data.pipe(converter);
	});

	it('Custom event attribute should be converted to a JSON-LD objet with additional comment property', (t, done) => {
		const date = '1816';
		const type = 'Election as a Fellow of the Royal Society';
		const event = { TYPE: type, DATE: date };
		const data = createStreamFromObject({ data: { EVEN: event } });
		const converter = new Converter();
		const onData = spy(({ data: { EVEN: obj } }) => {
			expect(isObject(obj)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'date', `${rdfs.PREFIX}:comment`);
			expect(obj.date).to.equal(date);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(type);
		});
		converter.on('data', onData);
		converter.on('end', done);
		data.pipe(converter);
	});
};
