import { describe, it } from 'node:test';
import { expect } from 'chai';
import path from 'path';
import { TransformStream } from 'node:stream/web';

import { createStreamFromData } from './utils/stream.js';
import Parser from './parser.js';
import Deserializer from './deserializer.js';

const SAMPLE = path.resolve(process.cwd(), 'samples/smallest.ged');

describe('Deserializer', () => {
	it('Instances should be transform stream instances', () => {
		const deserializer = new Deserializer();
		expect(deserializer).to.be.instanceof(TransformStream);
		deserializer.writable.close();
	});

	it('Emitted chunk for simple object should have expected properties', async () => {
		const level = 0;
		const tag = 'TAG';
		const property = 'PROPERTY';
		const value = 'VALUE';
		const data = createStreamFromData([`${level} ${tag}`, `${level + 1} ${property} ${value}`]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			expect(obj).to.be.an('object');
			expect(obj).to.have.property('@type').that.equal(tag);
			expect(obj).to.have.property(property).that.equal(value);
			count += 1;
		}
		expect(count).to.equal(1);
	});

	it('Emitted chunks for object with CONC & CONT records should have expected properties', async () => {
		const level = 0;
		const tag = 'TAG';
		const property = 'PROPERTY';
		const value1 = 'VALUE1';
		const value2 = 'VALUE2';
		const value3 = 'VALUE3';
		const data = createStreamFromData([`${level} ${tag}`, `${level + 1} ${property} ${value1}`, `${level + 2} CONC ${value2}`, `${level + 2} CONT ${value3}`]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			if (count === 0) {
				expect(obj).to.be.an('object');
				expect(obj['@type']).to.equal(tag);
				expect(obj).to.include({ [property]: `${value1}${value2}\n${value3}` });
			}
			count += 1;
		}
		expect(count).to.equal(1);
	});

	it('Emitted chunks for object with duplicate properties should have expected properties', async () => {
		const level = 0;
		const tag = 'TAG';
		const property = 'PROPERTY';
		const subproperty = 'SUBPROPERTY';
		const value1 = 'VALUE1';
		const value2 = 'VALUE2';
		const value3 = 'VALUE3';
		const data = createStreamFromData([`${level} ${tag}`, `${level + 1} ${property} ${value1}`, `${level + 1} ${property} ${value2}`, `${level + 2} ${subproperty} ${value3}`]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			expect(obj).to.be.an('object');
			if (count === 0) {
				expect(obj).to.have.property('@value').that.equal(value2);
				expect(obj).to.have.property(subproperty).that.equal(value3);
			} else if (count === 0) {
				expect(obj['@type']).to.equal(tag);
				expect(obj).to.have.property(property).to.be.an('array');
				expect(obj.property[0]).to.equal(value1);
				expect(obj.property[1]).to.have.property('@value').that.equal(value2);
				expect(obj.property[1]).to.have.property(subproperty).that.equal(value3);
			}
			count += 1;
		}
	});

	it('Emitted chunks for object with nested hierarchy should have expected properties', async () => {
		const level = 0;
		const tag = 'TAG';
		const property1 = 'PROPERTY1';
		const property2 = 'PROPERTY2';
		const subproperty = 'SUBPROPERTY';
		const value1 = 'VALUE1';
		const value2 = 'VALUE2';
		const data = createStreamFromData([`${level} ${tag}`, `${level + 1} ${property1}`, `${level + 2} ${subproperty} ${value1}`, `${level + 1} ${property2} ${value2}`]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		const chunks = [];
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			chunks.push(obj);
		}
		expect(chunks.length).to.equal(2);
		const [child, parent] = chunks;
		expect(child['@parent']).to.equal(parent);
		expect(child['@type']).to.equal(property1);
		expect(child).to.include({ [subproperty]: value1 });
		expect(parent['@type']).to.equal(tag);
		expect(parent).to.include({ [property1]: child, [property2]: value2 });
	});

	it('Emitted chunks for several objects should have expected properties', async () => {
		const tags = [1, 2, 3];
		const data = createStreamFromData(tags.reduce((lines, i) => lines.concat([`0 tag${i}`, `1 property${i} value${i}`]), []));
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			expect(obj).to.be.an('object');
			expect(obj['@type']).to.match(/tag([0-9]+)/i);
			const index = obj['@type'].match(/tag([0-9]+)/i)[1];
			expect(obj).to.include({ [`property${index}`]: `value${index}` });
			count += 1;
		}
		expect(count).to.equal(tags.length);
	});

	it('Emitted chunks cross-references should be resolved when referenced record is previously emitted', async () => {
		const level = 0;
		const tag1 = 'TAG';
		const ref = '@REF@';
		const tag2 = 'TAG';
		const property = 'PROPERTY';
		const data = createStreamFromData([`${level} ${ref} ${tag1}`, `${level} ${tag2}`, `${level + 1} ${property} ${ref}`]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		let reference;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			if (count === 0) {
				reference = obj;
			} else {
				expect(obj[property]).to.equal(reference);
			}
			count += 1;
		}
	});

	it('Emitted chunks cross-references should be resolved when referenced record is not previously emitted', async () => {
		const level = 0;
		const tag1 = 'TAG';
		const ref = '@REF@';
		const tag2 = 'TAG';
		const property = 'PROPERTY';
		const data = createStreamFromData([`${level} ${tag2}`, `${level + 1} ${property} ${ref}`, `${level} ${ref} ${tag1}`]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		let reference;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			if (count === 0) {
				reference = obj[property];
			} else {
				expect(obj).to.equal(reference);
			}
			count += 1;
		}
	});
});
