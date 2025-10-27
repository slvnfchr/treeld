import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { AGE } from '../gedcom/constants.js';
import { isObject, schema } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Simple age property should not be converted', async () => {
		const src = { AGE: '26y', OTHER: 'value' };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.be.an('object');
			expect(obj).to.have.all.keys('AGE', 'OTHER');
			expect(obj.AGE).to.equal(src.AGE);
		}
	});

	it('Age object with simple value should be converted to Duration object', async () => {
		const src = { '@type': AGE, '@value': '26y' };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.DURATION)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'value');
			expect(obj.value).to.equal('P26Y');
		}
	});

	it('Age object with minimum value should be converted to Duration object with minValue', async () => {
		const src = { '@type': AGE, '@value': '>10m' };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.minValue).to.equal('P10M');
		}
	});

	it('Age object with maximum value should be converted to Duration object with maxValue', async () => {
		const src = { '@type': AGE, '@value': '<60d' };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.maxValue).to.equal('P60D');
		}
	});

	it('Age object with phrase substructure should be converted to Duration object with description', async () => {
		const description = 'Stillborn';
		const src = { '@type': AGE, '@value': '0d', 'PHRASE': description };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.value).to.equal('P0D');
			expect(obj.description).to.equal(description);
		}
	});
};
