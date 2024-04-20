import { describe, it } from 'node:test';
import { Transform } from 'stream';

import Converter from './converter.js';

import context from './converter/context.spec.js';
import date from './converter/date.spec.js';
import place from './converter/place.spec.js';
import event from './converter/event.spec.js';
import source from './converter/source.spec.js';
import address from './converter/address.spec.js';
import repository from './converter/repository.spec.js';

describe('Converter', () => {

	it('Instances should be transform stream instances', (t, done) => {
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
