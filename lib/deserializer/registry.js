/**
 * @typedef {import('../parser/types.ts').Xref} Xref
 * @typedef {import('../parser/types.ts').Tag} Tag
 * @typedef {import('./types.ts').ChunkWith<Object>} Chunk
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
	 * @param {import('./converter/types.ts').ConversionLogger} [logger] Logger to collect informations and errors
	 */
	resolveReferences(logger) {
		this.complete = true;
		Array.from(this.map.entries()).forEach(([key, { value, references }]) => {
			references.forEach((ref) => {
				try {
					ref(value);
				} catch (e) {
					logger.error(`Cannot resolve reference ${key}`);
				}
			});
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
		'@index': { enumerable: false, writable: true, value: 0 },
		'@ref': { enumerable: false, writable: true },
	});
	if (proxy['@ref']) {
		registry.set(proxy['@ref'], proxy);
	}
	return proxy;
};
