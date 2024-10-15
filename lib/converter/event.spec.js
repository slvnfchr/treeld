import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { EVENT } from '../gedcom.js';
import { isObject, bio, schema, rdfs } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Event attribute with known type should be converted to a JSON-LD objet with corresponding type', async () => {
		const date = '26 DEC 1791';
		const country = 'United Kingdom';
		const locality = 'London';
		const place = `${locality}, ${country}`;
		const src = { '@type': 'BIRT', 'DATE': date, 'PLAC': place };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, bio.TYPES.BIRTH)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'date', 'place');
			expect(obj.date).to.equal('1791-12-26');
			expect(isObject(obj.place, schema.TYPES.PLACE)).to.be.true;
			expect(obj.place.name).to.equal(place);
		}
	});

	it('Event attribute with unknown type should be converted to a JSON-LD objet with additional type annotation', async () => {
		const date = '1841';
		const place = 'London, United Kingdom';
		const src = { '@type': 'CENS', 'DATE': date, 'PLAC': place };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		let count = 0;
		for await (const obj of data.pipeThrough(converter)) {
			if (count == 1) {
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@type', 'date', 'place');
				expect(obj['@type']).to.match(/^#/i);
			} else {
				// Additional stream chunk for event type
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@id', '@type', 'rdfs:label', 'rdfs:comment');
			}
			count += 1;
		}
		expect(count).to.equal(2);
	});

	it('Custom event attribute should be converted to a JSON-LD objet with additional comment property', async () => {
		const date = '1816';
		const type = 'Election as a Fellow of the Royal Society';
		const src = { '@type': EVENT, 'TYPE': type, 'DATE': date };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'date', `${rdfs.PREFIX}:comment`);
			expect(obj.date).to.equal(date);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(type);
		}
	});
};
