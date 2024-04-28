import { describe, it } from 'node:test';
import path from 'path';
import { TransformStream } from 'node:stream/web';

import { createStreamFromData, createStreamFromFile } from './utils/stream.js';
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
			expect(obj).to.have.property('type').that.equal(tag);
			expect(obj)
				.to.have.property('data')
				.that.deep.equal({ [property]: value });
			count += 1;
		}
		expect(count).to.equal(1);
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
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			expect(obj).to.be.an('object');
			expect(obj).to.have.all.keys('level', 'type', 'data');
			if (count === 0) {
				expect(obj.level).to.equal(1);
				expect(obj.type).to.equal(property1);
				expect(obj.data).to.deep.equal({ [subproperty]: value1 });
			} else if (count === 1) {
				expect(level).to.equal(0);
				expect(obj.type).to.equal(tag);
				expect(obj.data).to.deep.equal({ [property1]: { [subproperty]: value1 }, [property2]: value2 });
			}
			count += 1;
		}
		expect(count).to.equal(2);
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
			expect(obj).to.be.an('object');
			expect(obj).to.have.all.keys('level', 'type', 'data');
			expect(obj.type).to.equal(tag);
			expect(obj.data).to.deep.equal({ [property]: `${value1}${value2}\n${value3}` });
			count += 1;
		}
		expect(count).to.equal(1);
	});

	it('Emitted chunks for several objects should have expected properties', async () => {
		const tags = [1, 2, 3];
		const data = createStreamFromData(tags.reduce((lines, i) => lines.concat([`0 tag${i}`, `1 property${i} value${i}`]), []));
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			expect(obj).to.be.an('object');
			expect(obj)
				.to.have.property('type')
				.that.match(/tag([0-9]+)/i);
			const index = obj.type.match(/tag([0-9]+)/i)[1];
			expect(obj)
				.to.have.property('data')
				.that.deep.equal({ [`property${index}`]: `value${index}` });
			count += 1;
		}
		expect(count).to.equal(tags.length);
	});

	it('Stream should emit proper chunks according to source file', async () => {
		const data = createStreamFromFile(SAMPLE);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let count = 0;
		for await (const obj of data.pipeThrough(parser).pipeThrough(deserializer)) {
			if (count === 0) {
				expect(obj.level).to.equal(1);
				expect(obj.type).to.equal('GEDC');
				expect(obj.data).to.have.all.keys('VERS', 'FORM');
			} else if (count === 1) {
				expect(obj.level).to.equal(0);
				expect(obj.type).to.equal('HEAD');
				expect(obj.data).to.have.all.keys('SOUR', 'SUBM', 'GEDC', 'CHAR');
			} else if (count === 2) {
				expect(obj.level).to.equal(0);
				expect(obj.type).to.equal('SUBM');
				expect(obj.data).to.have.all.keys('@id', 'NAME');
				expect(obj.data['@id']).to.equal('@U@');
			}
			count += 1;
		}
		expect(count).to.equal(3);
	});
});
