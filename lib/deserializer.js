import { TransformStream } from 'node:stream/web';

import { LEVEL, TAG, VALUE, XREF, CONCATENATION, CONTINUATION } from './gedcom.js';

/**
 * Enqueue records chunks
 * @function enqueue
 * @param {import('./deserializer/types.ts').Chunk[]} records The records array to enqueue
 * @param {Number} level The level up to which records should be enqueue
 * @param {TransformStreamDefaultController} controller Transform stream to enqueue records to
 */

const enqueue = (records, level, controller) => {
	while (records.length > level + 1) {
		const data = records.pop();
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
		/**
		 * @type {import('./deserializer/types.ts').Chunk[]}
		 */
		const parents = [{}];
		let previous = null;
		let previousRef = null;
		const registry = new Map();
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
							if (!registry.has(previousRef)) registry.set(previousRef, {});
							parent[previous] = registry.get(previousRef);
							previousObj = parent[previous];
						} else if (Array.isArray(parent[previous])) {
							const previousValue = parent[previous][parent[previous].length - 1];
							previousObj = previousValue ? { '@value': previousValue } : {};
							parent[previous][parent[previous].length - 1] = previousObj;
							previousObj['@index'] = parent[previous].length - 1;
						} else {
							const previousValue = parent[previous];
							previousObj = previousValue ? { '@value': previousValue } : {};
							parent[previous] = previousObj;
						}
						Object.defineProperties(previousObj, {
							'@parent': { enumerable: false, writable: true },
							'@type': { enumerable: false, writable: true },
							'@index': { enumerable: false, writable: true },
						});
						if (level > 1) previousObj['@parent'] = parent;
						previousObj['@type'] = previous;
						previousObj[tag] = value;
						parents.splice(parents.length, 0, previousObj);
					}
				} else {
					if (level < parents.length - 1) enqueue(parents, level, controller);
					if (/@[0-9]+@/i.test(value)) {
						if (!registry.has(value)) registry.set(value, {});
						parents[level][tag] = registry.get(value);
					} else if (parents[level][tag]) {
						if (!Array.isArray(parents[level][tag])) parents[level][tag] = [parents[level][tag]];
						parents[level][tag].push(ref || value);
					} else {
						parents[level][tag] = ref || value;
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
			},
		});
	}
}
