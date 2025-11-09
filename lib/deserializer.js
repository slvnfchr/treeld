import { TransformStream, WritableStream } from 'node:stream/web';

import { LEVEL, TAG, VALUE, XREF } from './parser.js';
import { CONCATENATION, CONTINUATION } from './gedcom/constants.js';
import { createChunk, Registry } from './deserializer/registry.js';

/**
 * @typedef {import('./parser/types.ts').Xref} Xref
 * @typedef {import('./parser/types.ts').Tag} Tag
 * @typedef {import('./deserializer/types.ts').ChunkWith<Object>} Chunk
 */

/**
 * Enqueue chunks
 * @function enqueue
 * @param {Chunk[]} chunks The chunks array to enqueue
 * @param {Number} level The level up to which records should be enqueue
 * @param {TransformStreamDefaultController} controller Transform stream to enqueue records to
 */

const enqueue = (chunks, level, controller) => {
	while (chunks.length > level + 1) {
		const data = chunks.pop();
		controller.enqueue(data);
	}
};

/**
 * Parsed GEDCOM data stream deserializer that rebuild object according to level
 * @const Deserializer
 * @type {TransformStream}
 * @instance
 */

export default class Deserializer extends TransformStream {
	constructor() {
		const registry = new Registry();
		/** @type {Chunk[]} */
		const parents = [createChunk(registry)];
		/** @type {Tag} */
		let previous;
		/** @type {Xref} */
		let previousRef;
		super({
			/**
			 * @param {import('./parser/types.ts').Chunk} chunk
			 * @param {TransformStreamDefaultController} controller
			 */
			transform(chunk, controller) {
				const { [LEVEL]: level, [XREF]: ref, [TAG]: tag, [VALUE]: value } = chunk;
				const multipart = tag === CONCATENATION || tag === CONTINUATION;
				if (level > parents.length - 1) {
					const parent = parents[parents.length - 1];
					if (multipart) {
						const glue = tag === CONTINUATION ? '\n' : '';
						parent[previous] = [parent[previous], value].join(glue);
					} else {
						/** @type {Chunk} */
						let previousObj;
						if (previousRef) {
							parent[previous] = registry.get(previousRef);
							previousObj = parent[previous];
						} else if (Array.isArray(parent[previous])) {
							const previousValue = parent[previous][parent[previous].length - 1];
							previousObj = createChunk(registry, previousValue ? { '@value': previousValue } : {});
							parent[previous][parent[previous].length - 1] = previousObj;
							previousObj['@index'] = parent[previous].length - 1;
						} else {
							const previousValue = parent[previous];
							previousObj = createChunk(registry, previousValue ? { '@value': previousValue } : {});
							parent[previous] = previousObj;
						}
						if (level > 1) previousObj['@parent'] = parent;
						previousObj['@type'] = previous;
						previousObj[tag] = value;
						parents.splice(parents.length, 0, previousObj);
					}
				} else {
					if (level < parents.length - 1) enqueue(parents, level, controller);
					if (parents[level][tag]) {
						if (!Array.isArray(parents[level][tag])) parents[level][tag] = [parents[level][tag]];
						parents[level][tag].push(value);
					} else {
						parents[level][tag] = value;
					}
					if (ref) {
						registry.set(ref, createChunk(registry, { '@ref': ref }));
					}
				}
				if (!multipart) previous = tag;
				previousRef = ref;
			},
			/**
			 * @param {TransformStreamDefaultController} controller
			 */
			flush(controller) {
				enqueue(parents, 0, controller);
				registry.complete = true;
			},
		});
	}
	/**
	 * All converted chunks
	 * @return {Promise<Array<Chunk>>}
	 */
	chunks() {
		return new Promise((resolve) => {
			/** @type {Chunk[]} */
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
