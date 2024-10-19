import { TransformStream } from 'node:stream/web';

import { LEVEL, TAG, VALUE, XREF, CONCATENATION, CONTINUATION } from './gedcom.js';

/**
 * Enqueue records chunks
 * @function enqueue
 * @param {Array} records The records array to enqueue
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
		const parents = [{}];
		let previous = null;
		let previousRef = null;
		const registry = new Map();
		super({
			transform(chunk, controller) {
				const { [LEVEL]: level, [XREF]: ref, [TAG]: tag, [VALUE]: value } = chunk;
				const multipart = tag === CONCATENATION || tag === CONTINUATION;
				if (level > parents.length - 1) {
					if (multipart) {
						const glue = tag === CONTINUATION ? '\n' : '';
						const parent = parents[parents.length - 1];
						parent[previous] = [parent[previous], value].join(glue);
					} else {
						if (previousRef) {
							if (!registry.has(previousRef)) registry.set(previousRef, {});
							parents[parents.length - 1][previous] = registry.get(previousRef);
						} else {
							const previousValue = parents[parents.length - 1][previous];
							parents[parents.length - 1][previous] = previousValue ? { '@value': previousValue } : {};
						}
						if (level > 1) parents[parents.length - 1][previous]['@parent'] = parents[parents.length - 1];
						parents[parents.length - 1][previous]['@type'] = previous;
						parents[parents.length - 1][previous][tag] = value;
						parents.splice(parents.length, 0, parents[parents.length - 1][previous]);
					}
				} else {
					if (level < parents.length - 1) enqueue(parents, level, controller);
					if (/@[0-9]+@/i.test(value)) {
						if (!registry.has(value)) registry.set(value, {});
						parents[level][tag] = registry.get(value);
					} else {
						parents[level][tag] = ref || value;
					}
				}
				if (!multipart) previous = tag;
				previousRef = ref;
			},
			flush(controller) {
				enqueue(parents, 0, controller);
			},
		});
	}
}
