import { TransformStream, WritableStream } from 'node:stream/web';

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
	/**
	 * @param {import('./converter/types.ts').ConversionLogger} [logger] Logger to collect conversion informations and errors
	 */
	constructor(logger) {
		const converters = new Map([...date, ...place, ...event, ...source, ...address, ...repository]);
		super({
			/**
			 * @param {import('./deserializer/types.ts').Chunk} obj
			 * @param {TransformStreamDefaultController} controller
			 */
			transform(obj, controller) {
				let result = obj;
				if (converters.has(obj['@type'])) {
					const { value, info, warn, error } = converters.get(obj['@type'])(obj, controller);
					if (obj['@parent']) {
						if (value) {
							const property = obj['@parent'][obj['@type']];
							if (Array.isArray(property)) {
								property[obj['@index']] = value;
							} else {
								obj['@parent'][obj['@type']] = value;
							}
						} else {
							delete obj['@parent'][obj['@type']];
						}
					}
					result = value;
					if (logger && info) logger.info(info);
					if (logger && warn) logger.warn(warn);
					if (logger && error) logger.error(error);
				} else if (logger && !/^_/.test(obj['@type'])) {
					logger.warn(`Object ${obj['@type']} not supported`);
				}
				if (!obj['@parent']) controller.enqueue(result);
			},
		});
		/**
		 * @param {string} type Chunk type to which converter should be associated
		 * @param {import('./converter/types.ts').Converter<Object>} converter Chunk converter to add
		 */
		this.add = (type, converter) => converters.set(type, converter);
		//
	}
	/**
	 * All converted records
	 * @return {Promise<Array<Object>>}
	 */
	records() {
		return new Promise((resolve) => {
			const records = [];
			const writable = new WritableStream({
				write(chunk) {
					records.push(chunk);
				},
				close() {
					resolve(records);
				},
			});
			this.readable.pipeTo(writable);
		});
	}
}
