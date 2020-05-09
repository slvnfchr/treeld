
import { Transform } from 'stream';

import date from './converter/date';

/**
 * Deserialized GEDCOM data stream converter that transform object to JSON-LD data
 * @const Converter
 * @type {Class}
 * @instance
 */

export default class Converter extends Transform {

	constructor() {
		super({ objectMode: true });
		this.converters = [date];
	}

	_transform(obj, encoding, callback) { // eslint-disable-line no-underscore-dangle
		Object.keys(obj.data).forEach((property) => {
			this.converters.forEach((converter) => converter(obj.data, property));
		});
		this.push(obj);
		if (callback) callback.call(this);
	}

	_flush(callback) { // eslint-disable-line no-underscore-dangle
		if (callback) callback.call(this);
	}

}
