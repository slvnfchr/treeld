import { TransformStream } from 'node:stream/web';

import date from './converter/date.js';
import place from './converter/place.js';
import event from './converter/event.js';
import source from './converter/source.js';
import address from './converter/address.js';
import repository from './converter/repository.js';

const CONVERTERS = new Map([...date, ...place, ...event, ...source, ...address, ...repository]);

/**
 * Deserialized GEDCOM data stream converter that transform object to JSON-LD data
 * @const Converter
 * @type {TransformStream}
 * @instance
 */

export default class Converter extends TransformStream {
	constructor() {
		super({
			/**
			 * @param {import('./deserializer/types.ts').Chunk} obj
			 * @param {TransformStreamDefaultController} controller
			 */
			transform(obj, controller) {
				let value = obj;
				if (CONVERTERS.has(obj['@type'])) {
					value = CONVERTERS.get(obj['@type'])(obj, controller);
					if (obj['@parent']) {
						if (value) {
							obj['@parent'][obj['@type']] = value;
						} else {
							delete obj['@parent'][obj['@type']];
						}
					}
				}
				if (!obj['@parent']) controller.enqueue(value);
			},
		});
	}
}
