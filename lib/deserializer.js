
import { Transform } from 'stream';

import { LEVEL, TAG, VALUE, XREF } from './gedcom';

/**
 * Parsed GEDCOM data stream deserializer that rebuild object according to level
 * @const Deserializer
 * @type {Class}
 * @instance
 */

export default class Deserializer extends Transform {

	constructor() {
		super({ objectMode: true });
		this.parents = [{}];
		this.previous = null;
	}

	_flushParents(level) { // eslint-disable-line no-underscore-dangle
		while (this.parents.length > level + 1) {
			const data = this.parents.pop();
			const parent = this.parents[this.parents.length - 1];
			const type = Object.keys(parent).reduce((found, key) => (parent[key] === data ? key : found), null);
			this.push({ level, type, data });
		}
	}

	_transform(line, encoding, callback) { // eslint-disable-line no-underscore-dangle
		const { [LEVEL]: level, [TAG]: tag, [VALUE]: value, [XREF]: ref } = line;
		if (level > this.parents.length - 1) {
			const previousValue = this.parents[this.parents.length - 1][this.previous];
			Object.assign(this.parents[this.parents.length - 1], { [this.previous]: previousValue ? { '@id': previousValue } : {} });
			Object.assign(this.parents[this.parents.length - 1][this.previous], { [tag]: value });
			this.parents = this.parents.concat([this.parents[this.parents.length - 1][this.previous]]);
		} else {
			if (level < this.parents.length - 1) this._flushParents(level); // eslint-disable-line no-underscore-dangle
			Object.assign(this.parents[level], { [tag || ref]: tag && ref || value });
		}
		this.previous = tag || ref;
		if (callback) callback.call(this);
	}

	_flush(callback) { // eslint-disable-line no-underscore-dangle
		this._flushParents(0); // eslint-disable-line no-underscore-dangle
		if (callback) callback.call(this);
	}

}