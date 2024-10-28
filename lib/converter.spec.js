import { describe, it } from 'node:test';
import { expect } from 'chai';
import { TransformStream } from 'node:stream/web';

import Converter from './converter.js';

import datetime from './converter/datetime/index.spec.js';
import location from './converter/location/index.spec.js';
import text from './converter/text/index.spec.js';

import context from './converter/context.spec.js';
import date from './converter/date.spec.js';
import place from './converter/place.spec.js';
import event from './converter/event.spec.js';
import source from './converter/source.spec.js';
import address from './converter/address.spec.js';
import repository from './converter/repository.spec.js';

describe('Converter', () => {
	it('Instances should be transform stream instances', () => {
		const converter = new Converter();
		expect(converter).to.be.instanceof(TransformStream);
		converter.writable.close();
	});

	describe('Date & time utility', datetime);

	describe('Location utility', location);

	describe('Text utility', text);

	describe('Context module', context);

	describe('Date attribute', date);

	describe('Place attribute and/or record', place);

	describe('Event subrecords', event);

	describe('Sources records', source);

	describe('Address subrecords', address);

	describe('Repositories records', repository);
});
