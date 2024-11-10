import { describe, it } from 'node:test';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import { TransformStream } from 'node:stream/web';

chai.use(spies);

import Converter from './converter.js';
import { createStreamFromObject } from './utils/stream.js';

import datetime from './converter/datetime/index.spec.js';
import location from './converter/location/index.spec.js';
import text from './converter/text/index.spec.js';
import utils from './converter/utils.spec.js';

import context from './converter/context.spec.js';
import date from './converter/date.spec.js';
import place from './converter/place.spec.js';
import event from './converter/event.spec.js';
import individual from './converter/individual.spec.js';
import source from './converter/source.spec.js';
import address from './converter/address.spec.js';
import repository from './converter/repository.spec.js';

describe('Converter', () => {
	it('Instances should be transform stream instances', () => {
		const converter = new Converter();
		expect(converter).to.be.instanceof(TransformStream);
		converter.writable.close();
	});

	it('Instances should have records method returning all converted chunks', async () => {
		const chunks = [{ property: 'value' }, { property1: 'value1', property2: 'value2' }];
		const data = createStreamFromObject(chunks);
		const converter = new Converter();
		data.pipeThrough(converter);
		const records = await converter.records();
		expect(records).to.be.an('array');
		expect(records[0]).to.deep.equal(chunks[0]);
	});

	it('Instances should convert scalar and array values', async () => {
		const chunks = {
			SCALAR: { '@value': 'scalar' },
			ARRAY: [{ '@value': 'value1' }, { '@value': 'value2' }],
		};
		const converters = {
			SCALAR: () => ({ value: 'converted scalar' }),
			ARRAY: (obj) => ({ value: obj['@index'] === 0 ? 'first' : 'second' }),
		};
		const data = createStreamFromObject(chunks);
		const converter = new Converter();
		Object.keys(converters).forEach((type) => {
			converter.add(type, converters[type]);
		});
		data.pipeThrough(converter);
		const records = await converter.records();
		expect(chunks.SCALAR).to.equal(converters.SCALAR().value);
		expect(chunks.ARRAY).to.deep.equal(['first', 'second']);
	});

	it('Instances should removed invalid conversions and preserve unsupported values', async () => {
		const chunks = {
			INVALID: { '@value': 'invalid' },
			UNSUPPORTED: { '@value': 'unsupported' },
		};
		const converters = {
			INVALID: () => ({ value: null }),
		};
		const data = createStreamFromObject(chunks);
		const converter = new Converter();
		Object.keys(converters).forEach((type) => {
			converter.add(type, converters[type]);
		});
		data.pipeThrough(converter);
		await converter.records();
		expect(chunks.INVALID).to.be.undefined;
		expect(chunks.UNSUPPORTED).to.deep.equal({ '@value': 'unsupported' });
	});

	it('Instances should log informations and errors from each type converter', async () => {
		const chunks = {
			SUCCESS: { value: 'test', info: 'status', warn: 'warning' },
			ERROR: { value: null, error: new Error() },
			UNSUPPORTED: { value: null },
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
		expect(logger.warn).to.have.been.called.with(`Object UNSUPPORTED not supported`);
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

	describe('Individual records', individual);

	describe('Sources records', source);

	describe('Address subrecords', address);

	describe('Repositories records', repository);
});
