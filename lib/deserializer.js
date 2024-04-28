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
		const record = records[records.length - 1];
		const type = Object.keys(record).reduce((found, key) => (record[key] === data ? key : found), null);
		controller.enqueue({ level, type, data });
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
		super({
			start() {
				this.parents = [{}];
				this.previous = null;
			},
			transform(chunk, controller) {
				const { [LEVEL]: level, [TAG]: tag, [VALUE]: value, [XREF]: ref } = chunk;
				const multipart = tag === CONCATENATION || tag === CONTINUATION;
				if (level > this.parents.length - 1) {
					if (multipart) {
						const glue = tag === CONTINUATION ? '\n' : '';
						const parent = this.parents[this.parents.length - 1];
						Object.assign(parent, { [this.previous]: [parent[this.previous], value].join(glue) });
					} else {
						const previousValue = this.parents[this.parents.length - 1][this.previous];
						const previousName = this.previousRef ? '@id' : '@value';
						Object.assign(this.parents[this.parents.length - 1], { [this.previous]: previousValue ? { [previousName]: previousValue } : {} });
						Object.assign(this.parents[this.parents.length - 1][this.previous], { [tag]: value });
						this.parents = this.parents.concat([this.parents[this.parents.length - 1][this.previous]]);
					}
				} else {
					if (level < this.parents.length - 1) enqueue(this.parents, level, controller);
					Object.assign(this.parents[level], { [tag]: ref || value });
				}
				if (!multipart) this.previous = tag;
				this.previousRef = ref;
			},
			flush(controller) {
				enqueue(this.parents, 0, controller);
			},
		});
	}
}
