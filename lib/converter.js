import { TransformStream, WritableStream } from 'node:stream/web';

import passthrough from './converter/passthrough.js';
import date from './converter/date.js';
import place from './converter/place.js';
import event from './converter/event.js';
import individual from './converter/individual.js';
import source from './converter/source.js';
import address from './converter/address.js';
import repository from './converter/repository.js';
import multimedia from './converter/multimedia.js';
import file from './converter/file.js';
import note from './converter/note.js';

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
		const converters = new Map([...passthrough, ...date, ...place, ...event, ...individual, ...source, ...address, ...repository, ...file, ...multimedia, ...note]);
		let registry = null;
		super({
			/**
			 * @param {import('./deserializer/types.ts').Chunk} obj
			 * @param {TransformStreamDefaultController} controller
			 */
			transform(obj, controller) {
				registry = registry || obj['@registry'];
				let result = obj;
				if (converters.has(obj['@type'])) {
					const { value, info, warn, error } = converters.get(obj['@type'])(obj, controller);
					if (obj['@parent']) {
						const parent = obj['@parent'];
						const property =
							Object.keys(parent)
								.filter((key) => (Array.isArray(parent[key]) && parent[key].includes(obj)) || parent[key] === obj)
								.shift() || obj['@type'];
						if (value) {
							if (Array.isArray(parent[property])) {
								parent[property][obj['@index']] = value;
							} else {
								parent[property] = value;
							}
						} else {
							delete parent[property];
						}
					}
					if (obj['@ref']) {
						registry.set(obj['@ref'], value);
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
			/**
			 * @param {TransformStreamDefaultController} controller
			 */
			flush() {
				registry.resolveReferences();
			},
		});
		/**
		 * @param {string} type Chunk type to which converter should be associated
		 * @param {import('./converter/types.ts').Converter<Object>} converter Chunk converter to add
		 */
		this.add = (type, converter) => converters.set(type, converter);
	}
	/**
	 * All converted chunks
	 * @return {Promise<Array<Object>>}
	 */
	chunks() {
		return new Promise((resolve) => {
			const chunks = [];
			const writable = new WritableStream({
				write(chunk) {
					chunks.push(chunk);
				},
				close() {
					resolve(chunks);
				},
			});
			this.readable.pipeTo(writable);
		});
	}
}
