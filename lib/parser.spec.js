import { describe, it } from 'node:test';
import path from 'path';
import { TransformStream } from 'node:stream/web';

import { createStreamFromData, createStreamFromFile } from './utils/stream.js';
import { LEVEL, TAG, VALUE, XREF, HEADER, SUBMITTER, TRAILER } from './gedcom.js';
import Parser from './parser.js';

const SAMPLE = path.resolve(process.cwd(), 'samples/smallest.ged');

describe('Parser', () => {
	it('Instances should be transform stream instances', () => {
		const parser = new Parser();
		expect(parser).to.be.instanceof(TransformStream);
		parser.writable.close();
	});

	it('Emitted object for simple tag (eventually custom ones) should only have level and tag properties', async () => {
		const level = 10;
		const tag = 'TAG';
		const custom = '_TAG';
		const data = createStreamFromData([`${level} ${tag}`, `${level} ${custom}`]);
		const parser = new Parser();
		for await (const line of data.pipeThrough(parser)) {
			expect(line).to.be.an('object');
			expect(line).to.have.property(LEVEL).that.equal(level);
			expect(line).to.have.property(TAG).that.equal(tag);
			expect(line).to.not.have.property(VALUE);
			expect(line).to.not.have.property(XREF);
		}
	});

	it('Emitted object for tag with value should have level, tag and value properties', async () => {
		const level = 10;
		const tag = 'TAG';
		const value = 'value';
		const data = createStreamFromData(`${level} ${tag} ${value}`);
		const parser = new Parser();
		for await (const line of data.pipeThrough(parser)) {
			expect(line).to.be.an('object');
			expect(line).to.have.property(LEVEL).that.equal(level);
			expect(line).to.have.property(TAG).that.equal(tag);
			expect(line).to.have.property(VALUE).that.equal(value);
			expect(line).to.not.have.property(XREF);
		}
	});

	it('Emitted object for tag with xref should have level, tag and xref properties', async () => {
		const level = 10;
		const tag = 'TAG';
		const xref = '@123@';
		const data = createStreamFromData(`${level} ${xref} ${tag}`);
		const parser = new Parser();
		for await (const line of data.pipeThrough(parser)) {
			expect(line).to.be.an('object');
			expect(line).to.have.property(LEVEL).that.equal(level);
			expect(line).to.have.property(TAG).that.equal(tag);
			expect(line).to.not.have.property(VALUE);
			expect(line).to.have.property(XREF).that.equal(xref);
		}
	});

	it('Stream should emit proper objects according to source file whatever stream chunk size is', async () => {
		const chunkSizes = [4, 16, 1024]; // Smaller than one line, several line at once, whole file at once
		const parse = (chunkSize) => async () => {
			const data = createStreamFromFile(SAMPLE, { highWaterMark: chunkSize });
			const parser = new Parser();
			let count = 0;
			for await (const line of data.pipeThrough(parser)) {
				count++;
			}
			expect(count).to.equal(10);
		};
		await chunkSizes.reduce((chain, chunkSize) => chain.then(parse(chunkSize)), Promise.resolve());
	});

	it('Stream should emit proper objects according to source file', async () => {
		const data = createStreamFromFile(SAMPLE);
		const parser = new Parser();
		let index = 1;
		for await (const line of data.pipeThrough(parser)) {
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
		}
	});
});
