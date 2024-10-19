import fs from 'node:fs/promises';
import { ReadableStream } from 'node:stream/web';

/**
 * Create readable stream from data array
 * @function createStreamFromData
 * @param {String|String[]} data A string or an array of string
 * @returns {ReadableStream} The created readable stream
 * @instance
 */

export const createStreamFromData = (data) => {
	const lines = (Array.isArray(data) ? data : [data]).map((l) => `${l}\n`).join('');
	const buff = Buffer.from(lines, 'utf-8');
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(buff);
			controller.close();
		},
	});
	return stream;
};

/**
 * Create data chunks from file with shared buffer
 * @function getFileChunks
 * @param {String} file The file path
 * @param {Number} size An optional chunk size. Defaults to 64KB
 * @returns {Iterable} The created chunks iterable
 */

async function* getFileChunks(file, size = 64 * 1024) {
	const sharedBuffer = Buffer.alloc(size);
	const stats = await fs.stat(file);
	const fd = await fs.open(file);
	let bytesRead = 0;
	let end = size;
	for (let i = 0; i < Math.ceil(stats.size / size); i++) {
		await fd.read(sharedBuffer, 0, sharedBuffer.length, null);
		bytesRead = (i + 1) * size;
		if (bytesRead > stats.size) {
			end = size - (bytesRead - stats.size);
		}
		yield sharedBuffer.subarray(0, end);
	}
	fd.close();
}

/**
 * Create readable stream from file data
 * @function createStreamFromFile
 * @param {String} file The file path
 * @param {Object} [options] An optional options object to pass to readable stream
 * @returns {ReadableStream} The created readable stream
 * @instance
 */

export const createStreamFromFile = (file, options = {}) => {
	const stream = new ReadableStream({
		async start(controller) {
			for await (const chunk of getFileChunks(file, options.highWaterMark)) {
				controller.enqueue(chunk);
			}
			controller.close();
		},
	});
	return stream;
};

/**
 * Enqueue chunk to stream
 * @function enqueue
 * @param {Object} chunk An object to enqueue
 * @param {ReadableStreamDefaultController} controller Stream controller to enqueue chunk to
 * @private
 */

const enqueue = (chunk, controller) => {
	Object.keys(chunk)
		.filter((key) => key !== '@parent')
		.forEach((key) => {
			if (Object.prototype.toString.call(chunk[key]) === '[object Object]') {
				chunk[key]['@parent'] = chunk;
				chunk[key]['@type'] = key;
				enqueue(chunk[key], controller);
			}
		});
	controller.enqueue(chunk);
};

/**
 * Create readable stream from object or array of objects
 * @function createStreamFromObject
 * @param {Object|Object[]} obj An object or an array of objects
 * @returns {ReadableStream} The created readable stream
 * @instance
 */

export const createStreamFromObject = (obj) => {
	const chunks = Array.isArray(obj) ? obj : [obj];
	const stream = new ReadableStream({
		start(controller) {
			chunks.forEach((chunk) => enqueue(chunk, controller));
			controller.close();
		},
	});
	return stream;
};
