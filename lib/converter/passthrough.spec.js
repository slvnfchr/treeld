import { it } from 'node:test';
import chai, { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { CREATION_DATE, CHANGE_DATE } from '../gedcom/constants.js';
import Converter from '../converter.js';

export default () => {
	it('Should leave objects unchanged', async () => {
		const inputs = [
			{ '@type': CREATION_DATE, 'DATE': { '@value': '1 JAN 2023' } },
			{ '@type': CHANGE_DATE, 'DATE': { '@value': '1 JAN 2023' } },
			{ '@type': 'UNSUPPORTED', '@value': 'value' },
		];
		const logger = { info: chai.spy(), warn: chai.spy(), error: chai.spy() };
		const data = createStreamFromObject(inputs);
		const converter = new Converter(logger);

		let count = 0;
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.deep.equal(inputs[count]);
			count++;
		}
		expect(count).to.equal(inputs.length);
		expect(logger.warn).to.have.been.called.once;
	});
};
