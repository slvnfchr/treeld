import { describe, it } from 'node:test';
import path from 'path';
import { Transform } from 'stream';

import { createStreamFromData, createStreamFromFile } from './utils/stream.js';
import { LEVEL, TAG, VALUE, XREF, HEADER, SUBMITTER, TRAILER } from './gedcom.js';
import Parser from './parser.js';

const SAMPLE = path.resolve(process.cwd(), 'samples/smallest.ged');

describe('Parser', () => {
	it('Instances should be transform stream instances', (t, done) => {
		const parser = new Parser();
		expect(parser).to.be.instanceof(Transform);
		parser.end();
		done();
	});

	it('Emitted object for simple tag (eventually custom ones) should only have level and tag properties', (t, done) => {
		const level = 10;
		const tag = 'TAG';
		const custom = '_TAG';
		const data = createStreamFromData([`${level} ${tag}`, `${level} ${custom}`]);
		const parser = new Parser();
		const onData = spy((line) => {
			expect(line).to.be.an('object');
			expect(line).to.have.property(LEVEL).that.equal(level);
			expect(line).to.have.property(TAG).that.equal(tag);
			expect(line).to.not.have.property(VALUE);
			expect(line).to.not.have.property(XREF);
		});
		parser.on('data', onData);
		parser.on('end', done);
		data.pipe(parser);
	});

	it('Emitted object for tag with value should have level, tag and value properties', (t, done) => {
		const level = 10;
		const tag = 'TAG';
		const value = 'value';
		const data = createStreamFromData(`${level} ${tag} ${value}`);
		const parser = new Parser();
		const onData = spy((line) => {
			expect(line).to.be.an('object');
			expect(line).to.have.property(LEVEL).that.equal(level);
			expect(line).to.have.property(TAG).that.equal(tag);
			expect(line).to.have.property(VALUE).that.equal(value);
			expect(line).to.not.have.property(XREF);
		});
		parser.on('data', onData);
		parser.on('end', done);
		data.pipe(parser);
	});

	it('Emitted object for tag with xref should have level, tag and xref properties', (t, done) => {
		const level = 10;
		const tag = 'TAG';
		const xref = '@123@';
		const data = createStreamFromData(`${level} ${xref} ${tag}`);
		const parser = new Parser();
		const onData = spy((line) => {
			expect(line).to.be.an('object');
			expect(line).to.have.property(LEVEL).that.equal(level);
			expect(line).to.have.property(TAG).that.equal(tag);
			expect(line).to.not.have.property(VALUE);
			expect(line).to.have.property(XREF).that.equal(xref);
		});
		parser.on('data', onData);
		parser.on('end', done);
		data.pipe(parser);
	});

	it('Stream should emit proper objects according to source file whatever stream chunk size is', (t, done) => {
		const chunkSizes = [4, 16, 1024]; // Smaller than one line, several line at once, whole file at once
		const parse = (chunkSize) =>
			new Promise((resolve) => {
				const data = createStreamFromFile(SAMPLE, { highWaterMark: chunkSize });
				const parser = new Parser();
				const onData = spy();
				parser.on('data', onData);
				parser.on('end', () => {
					expect(onData).to.have.been.called.exactly(10);
					resolve();
				});
				data.pipe(parser);
			});
		chunkSizes.reduce((chain, chunkSize) => chain.then(parse(chunkSize)), Promise.resolve()).then(done);
	});

	it('Stream should emit proper objects according to source file', (t, done) => {
		const data = createStreamFromFile(SAMPLE);
		const parser = new Parser();
		let index = 1;
		const onData = spy((line) => {
			const { [TAG]: tag, [LEVEL]: level, [VALUE]: value, [XREF]: xref } = line;
			expect(level).to.be.a('number');
			expect(tag).to.be.a('string');
			if (tag === HEADER) {
				expect(level).to.equal(0);
				expect(value).to.be.undefined;
				expect(index).to.equal(1);
			} else if (tag === SUBMITTER) {
				if (level === 0) {
					expect(xref).to.equal('@U@');
				} else {
					expect(value).to.equal('@U@');
				}
			} else if (tag === TRAILER) {
				expect(level).to.equal(0);
				expect(value).to.be.undefined;
				expect(index).to.equal(10);
			}
			index += 1;
		});
		parser.on('data', onData);
		parser.on('end', () => {
			expect(onData).to.have.been.called.exactly(10);
			done();
		});
		data.pipe(parser);
	});
});
