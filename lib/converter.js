import { TransformStream } from 'node:stream/web';

import date from './converter/date.js';
import place from './converter/place.js';
import event from './converter/event.js';
import source from './converter/source.js';
import address from './converter/address.js';
import repository from './converter/repository.js';

/**
 * Deserialized GEDCOM data stream converter that transform object to JSON-LD data
 * @const Converter
 * @type {TransformStream}
 * @instance
 */

export default class Converter extends TransformStream {
	constructor() {
		super({
			start() {
				this.converters = [date, place, event, source, address, repository];
			},
			transform(obj, controller) {
				Object.keys(obj.data).forEach((property) => {
					this.converters.forEach((converter) => converter(obj.data, property, controller));
				});
				this.converters.forEach((converter) => converter(obj.data, obj.type, controller));
				controller.enqueue(obj);
			},
		});
	}
}
