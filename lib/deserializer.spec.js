import path from 'path';
import { Transform } from 'stream';

import { createStreamFromData, createStreamFromFile } from './utils/stream';
import Parser from './parser';
import Deserializer from './deserializer';

const SAMPLE = path.resolve(process.cwd(), 'samples/smallest.ged');

describe('Deserializer', () => {

	it('Instances should be transform stream instances', (done) => {
		const deserializer = new Deserializer();
		expect(deserializer).to.be.instanceof(Transform);
		deserializer.end();
		done();
	});

	it('Emitted chunk for simple object should have expected properties', (done) => {
		const level = 0;
		const tag = 'TAG';
		const property = 'PROPERTY';
		const value = 'VALUE';
		const data = createStreamFromData([
			`${level} ${tag}`,
			`${level + 1} ${property} ${value}`,
		]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		const onData = spy((obj) => {
			expect(obj).to.be.an('object');
			expect(obj).to.have.property('type').that.equal(tag);
			expect(obj).to.have.property('data').that.deep.equal({ [property]: value });
		});
		deserializer.on('data', onData);
		deserializer.on('end', () => {
			expect(onData).to.have.been.called.exactly(1);
			done();
		});
		data.pipe(parser).pipe(deserializer);
	});

	it('Emitted chunks for object with nested hierarchy should have expected properties', (done) => {
		const level = 0;
		const tag = 'TAG';
		const property1 = 'PROPERTY1';
		const property2 = 'PROPERTY2';
		const subproperty = 'SUBPROPERTY';
		const value1 = 'VALUE1';
		const value2 = 'VALUE2';
		const data = createStreamFromData([
			`${level} ${tag}`,
			`${level + 1} ${property1}`,
			`${level + 2} ${subproperty} ${value1}`,
			`${level + 1} ${property2} ${value2}`,
		]);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let chunk = 1;
		const onData = spy((obj) => {
			expect(obj).to.be.an('object');
			expect(obj).to.have.all.keys('level', 'type', 'data');
			if (chunk === 1) {
				expect(obj.level).to.equal(1);
				expect(obj.type).to.equal(property1);
				expect(obj.data).to.deep.equal({ [subproperty]: value1 });
			} else if (chunk === 2) {
				expect(level).to.equal(0);
				expect(obj.type).to.equal(tag);
				expect(obj.data).to.deep.equal({ [property1]: { [subproperty]: value1 }, [property2]: value2 });
			}
			chunk += 1;
		});
		deserializer.on('data', onData);
		deserializer.on('end', () => {
			expect(onData).to.have.been.called.exactly(2);
			done();
		});
		data.pipe(parser).pipe(deserializer);
	});

	it('Emitted chunks for several objects should have expected properties', (done) => {
		const tags = [1, 2, 3];
		const data = createStreamFromData(tags.reduce((lines, i) => lines.concat([`0 tag${i}`, `1 property${i} value${i}`]), []));
		const parser = new Parser();
		const deserializer = new Deserializer();
		const onData = spy((obj) => {
			expect(obj).to.be.an('object');
			expect(obj).to.have.property('type').that.match(/tag([0-9]+)/i);
			const index = obj.type.match(/tag([0-9]+)/i)[1];
			expect(obj).to.have.property('data').that.deep.equal({ [`property${index}`]: `value${index}` });
		});
		deserializer.on('data', onData);
		deserializer.on('end', () => {
			expect(onData).to.have.been.called.exactly(tags.length);
			done();
		});
		data.pipe(parser).pipe(deserializer);
	});

	it('Stream should emit proper chunks according to source file', (done) => {
		const data = createStreamFromFile(SAMPLE);
		const parser = new Parser();
		const deserializer = new Deserializer();
		let chunk = 1;
		const onData = spy((obj) => {
			if (chunk === 1) {
				expect(obj.level).to.equal(1);
				expect(obj.type).to.equal('GEDC');
				expect(obj.data).to.have.all.keys('VERS', 'FORM');
			} else if (chunk === 2) {
				expect(obj.level).to.equal(0);
				expect(obj.type).to.equal('HEAD');
				expect(obj.data).to.have.all.keys('SOUR', 'SUBM', 'GEDC', 'CHAR');
			} else if (chunk === 3) {
				expect(obj.level).to.equal(0);
				expect(obj.type).to.equal('SUBM');
				expect(obj.data).to.have.all.keys('@id', 'NAME');
				expect(obj.data['@id']).to.equal('@U@');
			}
			chunk += 1;
		});
		deserializer.on('data', onData);
		deserializer.on('end', () => {
			expect(onData).to.have.been.called.exactly(3);
			done();
		});
		data.pipe(parser).pipe(deserializer);
	});

});
