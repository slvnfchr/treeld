
import { Transform } from 'stream';

import Converter from './converter';

import date from './converter/date.spec';

describe('Converter', () => {

	it('Instances should be transform stream instances', (done) => {
		const converter = new Converter();
		expect(converter).to.be.instanceof(Transform);
		converter.end();
		done();
	});

	describe('Date attribute', date);

});
