import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { DATE } from '../gedcom.js';
import Converter from '../converter.js';

export default () => {
	it('Simple date property should not be converted to ISO 8601 date', async () => {
		const src = { DATE: '26 DEC 1791', OTHER: 'value' };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.be.an('object');
			expect(obj).to.have.all.keys('DATE', 'OTHER');
			expect(obj.DATE).to.equal('1791-12-26');
		}
	});

	it('Date object with time should be converted to ISO 8601 date', async () => {
		const src = { '@type': DATE, '@value': '26 DEC 1791', 'TIME': '12:00' };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.be.a('string');
			expect(obj).to.equal('1791-12-26T12:00:00.000Z');
		}
	});
};
