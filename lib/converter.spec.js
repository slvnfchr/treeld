
import { Transform } from 'stream';

import Converter from './converter';

import context from './converter/context.spec';
import date from './converter/date.spec';
import place from './converter/place.spec';
import event from './converter/event.spec';
import source from './converter/source.spec';
import address from './converter/address.spec';

describe('Converter', () => {

	it('Instances should be transform stream instances', (done) => {
		const converter = new Converter();
		expect(converter).to.be.instanceof(Transform);
		converter.end();
		done();
	});

	describe('Context module', context);

	describe('Date attribute', date);

	describe('Place attribute and/or record', place);

	describe('Event subrecords', event);

	describe('Sources records', source);

	describe('Address subrecords', address);

	describe('Repositories records', repository);
});
