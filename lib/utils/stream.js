import fs from 'fs';
import { Readable } from 'stream';

/**
 * Create readable stream from data array
 * @function createStreamFromData
 * @param {String|String[]} data A string or an array of string
 * @returns {Readable} The created readable stream
 * @instance
 */

export const createStreamFromData = (data) => {
	const stream = new Readable();
	const lines = (Array.isArray(data) ? data : [data]).map((l) => `${l}\n`).join('');
	const buff = Buffer.from(lines, 'utf-8');
	stream.push(buff);
	stream.push(null);
	return stream;
};

/**
 * Create readable stream from file data
 * @function createStreamFromFile
 * @param {String} file The file path
 * @param {Object} [options] An optional options object to pass to readable stream
 * @returns {Readable} The created readable stream
 * @instance
 */

export const createStreamFromFile = (file, options) => fs.createReadStream(file, options);

/**
 * Create readable stream from object or array of objects
 * @function createStreamFromObject
 * @param {Object|Object[]} obj An object or an array of objects
 * @returns {Readable} The created readable stream
 * @instance
 */

export const createStreamFromObject = (obj) => {
	const stream = new Readable({ objectMode: true });
	const chunks = Array.isArray(obj) ? obj : [obj];
	chunks.forEach((chunk) => stream.push(chunk));
	stream.push(null);
	return stream;
};
