import { TransformStream } from 'node:stream/web';

import { LEVEL, TAG, VALUE, XREF, CONCATENATION, CONTINUATION } from './gedcom.js';

/**
 * @typedef {import('./deserializer/types.ts').Chunk} Chunk
 * @typedef {import('./parser/types.ts').Xref} Xref
 */

/**
 * Chunk registry
 * @const Registry
 * @instance
 */

export class Registry {
	constructor() {
		this.map = new Map();
		this.complete = false;
	}
	/**
	 * Get chunk with given xref from registry
	 * @param {Xref} id Xref of chunk
	 * @returns {Chunk} Found chunk
	 */
	get(id) {
		return this.map.get(id).value;
	}
	/**
	 * Set chunk for given xref in registry
	 * @param {Xref} id Xref of chunk
	 * @param {Chunk} value Chunk
	 */
	set(id, value) {
		if (!this.map.has(id)) {
			this.map.set(id, { value, references: [] });
		} else {
			this.map.get(id).value = value;
		}
	}
	/**
	 * Set chunk for given xref in registry
	 * @param {Xref} id Xref of chunk
	 * @param {Function} fn A function referencing Xref chunk
	 */
	addReference(id, fn) {
		if (!this.map.has(id)) this.map.set(id, { value: null, references: [] });
		this.map.get(id).references.push(fn);
	}
	/**
	 * Resolve all pending references
	 */
	resolveReferences() {
		this.complete = true;
		Array.from(this.map.values()).forEach(({ value, references }) => {
			references.forEach((ref) => ref(value));
		});
	}
}

/**
 * Create chunk
 * @function createChunk
 * @param {Registry} registry Registry chunk belongs to
 * @param {Object} [data] Data object to create chunk from
 * @returns {Chunk} Created chunk
 * @instance
 */

export const createChunk = (registry, data = {}) => {
	const handler = {
		get(obj, property) {
			if (property !== '@ref' && /@[A-Z0-9]+@/i.test(obj[property]) && registry.complete) {
				return registry.get(obj[property]);
			}
			return Reflect.get(obj, property);
		},
	};
	const proxy = new Proxy(data, handler);
	Object.defineProperties(proxy, {
		'@registry': { enumerable: false, writable: false, value: registry },
		'@parent': { enumerable: false, writable: true },
		'@type': { enumerable: false, writable: true },
		'@index': { enumerable: false, writable: true },
		'@ref': { enumerable: false, writable: true },
	});
	if (proxy['@ref']) {
		registry.set(proxy['@ref'], proxy);
	}
	return proxy;
};

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
		/**
		 * @type {import('./deserializer/types.ts').Chunk[]}
		 */
		const parents = [createChunk(registry)];
		let previous = null;
		let previousRef = null;
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
						registry.set(ref, createChunk(registry, { '@ref': previousRef }));
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
				registry.resolveReferences();
			},
		});
	}
	/**
	 * All converted chunks
	 * @return {Promise<Array<import('./deserializer/types.ts').Chunk>>}
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
