import { Transform } from 'stream';

import date from './converter/date.js';
import place from './converter/place.js';
import event from './converter/event.js';
import source from './converter/source.js';
import address from './converter/address.js';
import repository from './converter/repository.js';

/**
 * Deserialized GEDCOM data stream converter that transform object to JSON-LD data
 * @const Converter
 * @type {Class}
 * @instance
 */

export default class Converter extends Transform {
	constructor() {
		super({ objectMode: true });
		this.converters = [date, place, event, source, address, repository];
	}

	// eslint-disable-next-line no-underscore-dangle
	_transform(obj, encoding, callback) {
		Object.keys(obj.data).forEach((property) => {
			this.converters.forEach((converter) => converter(obj.data, property, this));
		});
		this.converters.forEach((converter) => converter(obj.data, obj.type, this));
		this.push(obj);
		if (callback) callback.call(this);
	}

	// eslint-disable-next-line no-underscore-dangle
	_flush(callback) {
		if (callback) callback.call(this);
	}
}
