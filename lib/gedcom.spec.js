import path from 'path';
import fs from 'fs';
import { Readable, Transform } from 'stream';

import { expect, spy } from './utils/specs';

import * as gedcom from './gedcom';

const SAMPLE = path.resolve(process.cwd(), 'samples/smallest.ged');

/**
 * Create readable stream from string data
 * @function getStreamFromData
 * @returns {Readable} The created readable stream
 * @private
 */

const getStreamFromData = (data) => {
	const stream = new Readable();
	const buff = Buffer.from(data, 'utf-8');
	stream.push(buff);
	stream.push(null);
	return stream;
};

/**
 * Create readable stream from file data
 * @function getStreamFromFile
 * @returns {Readable} The created readable stream
 * @private
 */

const getStreamFromFile = (file, options) => fs.createReadStream(file, options);

describe('GEDCOM parser', () => {

	it('Instances should be transform stream instances', (done) => {
		const parser = new gedcom.Parser();
		expect(parser).to.be.instanceof(Transform);
		done();
	});

	it('Emitted object for simple tag (eventually custom ones) should only have level and tag properties', (done) => {
		const level = 10;
		const tag = 'TAG';
		const custom = '_TAG';
		const data = getStreamFromData(`${level} ${tag}\n${level} ${custom}\n`);
		const parser = new gedcom.Parser();
		const onData = spy((line) => {
			expect(line).to.be.an('object');
			expect(line).to.have.property(gedcom.LEVEL).that.equal(level);
			expect(line).to.have.property(gedcom.TAG).that.equal(tag);
			expect(line).to.not.have.property(gedcom.VALUE);
			expect(line).to.not.have.property(gedcom.XREF);
		});
		parser.on('data', onData);
		parser.on('end', done);
		data.pipe(parser);
	});

	it('Emitted object for tag with value should have level, tag and value properties', (done) => {
		const level = 10;
		const tag = 'TAG';
		const value = 'value';
		const data = getStreamFromData(`${level} ${tag} ${value}\n`);
		const parser = new gedcom.Parser();
		const onData = spy((line) => {
			expect(line).to.be.an('object');
			expect(line).to.have.property(gedcom.LEVEL).that.equal(level);
			expect(line).to.have.property(gedcom.TAG).that.equal(tag);
			expect(line).to.have.property(gedcom.VALUE).that.equal(value);
			expect(line).to.not.have.property(gedcom.XREF);
		});
		parser.on('data', onData);
		parser.on('end', done);
		data.pipe(parser);
	});

	it('Emitted object for tag with xref should have level, tag and xref properties', (done) => {
		const level = 10;
		const tag = 'TAG';
		const xref = '@123@';
		const data = getStreamFromData(`${level} ${xref} ${tag}\n`);
		const parser = new gedcom.Parser();
		const onData = spy((line) => {
			expect(line).to.be.an('object');
			expect(line).to.have.property(gedcom.LEVEL).that.equal(level);
			expect(line).to.have.property(gedcom.TAG).that.equal(tag);
			expect(line).to.not.have.property(gedcom.VALUE);
			expect(line).to.have.property(gedcom.XREF).that.equal(xref);
		});
		parser.on('data', onData);
		parser.on('end', done);
		data.pipe(parser);
	});

	it('Stream should emit proper objects according to source file whatever stream chunk size is', (done) => {
		const chunkSizes = [4, 16, 1024]; // Smaller than one line, several line at once, whole file at once
		const parse = (chunkSize) => new Promise((resolve) => {
			const data = getStreamFromFile(SAMPLE, { highWaterMark: chunkSize });
			const parser = new gedcom.Parser();
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

	it('Stream should emit proper objects according to source file', (done) => {
		const data = getStreamFromFile(SAMPLE);
		const parser = new gedcom.Parser();
		let index = 1;
		const onData = spy((line) => {
			const { [gedcom.TAG]: tag, [gedcom.LEVEL]: level, [gedcom.VALUE]: value, [gedcom.XREF]: xref } = line;
			expect(level).to.be.a('number');
			expect(tag).to.be.a('string');
			if (tag === gedcom.HEADER) {
				expect(level).to.equal(0);
				expect(value).to.be.undefined;
				expect(index).to.equal(1);
			} else if (tag === gedcom.SUBMITTER) {
				if (level === 0) {
					expect(xref).to.equal('@U@');
				} else {
					expect(value).to.equal('@U@');
				}
			} else if (tag === gedcom.TRAILER) {
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
