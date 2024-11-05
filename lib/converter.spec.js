import { describe, it } from 'node:test';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { TransformStream } from 'node:stream/web';

chai.use(spies);

import Converter from './converter.js';

import datetime from './converter/datetime/index.spec.js';
import location from './converter/location/index.spec.js';
import text from './converter/text/index.spec.js';
import utils from './converter/utils.spec.js';

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

	it('Instances should log informations and erros from each type converter', async () => {
		const chunks = {
			SUCCESS: { value: 'test', info: 'status', warn: 'warning' },
			ERROR: { value: null, error: new Error() },
		};
		const logger = { info: chai.spy(), warn: chai.spy(), error: chai.spy() };
		const data = new ReadableStream({
			async start(controller) {
				Object.keys(chunks).forEach((type) => controller.enqueue({ '@type': type }));
				controller.close();
			},
		});
		const converter = new Converter(logger);
		converter.add('SUCCESS', () => chunks.SUCCESS);
		converter.add('ERROR', () => chunks.ERROR);
		let index = 1;
		for await (const obj of data.pipeThrough(converter)) {
			if (index === 1) {
				expect(obj).to.equal(chunks.SUCCESS.value);
			} else if (index === 2) {
				expect(obj).to.equal(chunks.ERROR.value);
			}
			index += 1;
		}
		expect(logger.info).to.have.been.called.with(chunks.SUCCESS.info);
		expect(logger.warn).to.have.been.called.with(chunks.SUCCESS.warn);
		expect(logger.error).to.have.been.called.with(chunks.ERROR.error);
	});

	describe('Date & time utility', datetime);

	describe('Location utility', location);

	describe('Text utility', text);

	describe('Utilities', utils);

	describe('Context module', context);

	describe('Date attribute', date);

	describe('Place attribute and/or record', place);

	describe('Event subrecords', event);

	describe('Sources records', source);

	describe('Address subrecords', address);

	describe('Repositories records', repository);
});
