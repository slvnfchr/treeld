import { renameProperty, deleteProperty } from './utils.js';

/**
 * @typedef {import('./types.ts').Vocabulary} Vocabulary
 * @typedef {import('./types.ts').ObjectLD} ObjectLD
 */

/**
 * Vocabularies
 */

export * as schema from './context/schema.js';
export * as bio from './context/bio.js';
export * as foaf from './context/foaf.js';
export * as rdfs from './context/rdfs.js';
export * as dc from './context/dc.js';
export * as dcmitype from './context/dcmitype.js';

/**
 * Update context object properties according to its associated vocabularies
 * @function refresh
 * @param {Context} context The context object
 * @private
 */

const refresh = (context) => {
	const URIs = context.vocabularies.map((vocabulary) => vocabulary.URI);
	const defaultVocabulary = context.vocabularies[0].URI;
	const contextProperty = context.obj['@context'];
	Object.entries(contextProperty)
		.filter(([key, value]) => URIs.indexOf(value) === -1 || (value === defaultVocabulary && key !== '@vocab') || (value !== defaultVocabulary && key === '@vocab'))
		.forEach(([key]) => {
			delete contextProperty[key];
		});
	context.vocabularies.forEach((vocabulary, index) => Object.assign(contextProperty, { [index === 0 ? '@vocab' : vocabulary.PREFIX]: vocabulary.URI }));
};

/**
 * Context object
 * @const Context
 * @instance
 */
export class Context {
	constructor(obj) {
		this.obj = obj;
		this.vocabularies = [];
		Object.defineProperties(this, {
			obj: {
				enumerable: false,
				writable: false,
			},
			vocabularies: {
				enumerable: false,
				writable: false,
			},
		});
	}

	/**
	 * Set default object vocabulary
	 * @param {Vocabulary} vocabulary
	 */
	setDefault(vocabulary) {
		const current = this.vocabularies[0];
		const found = this.vocabularies.indexOf(vocabulary);
		if (found > 0) this.vocabularies.splice(found, 1);
		this.vocabularies.unshift(vocabulary);
		if (current !== vocabulary) {
			const prefixedProperty = /^[^:]+:.*/;
			const newProperty = new RegExp(`^${vocabulary.PREFIX}:`);
			Object.keys(this.obj)
				.filter((property) => !/^@/i.test(property))
				.forEach((property) => {
					if (!prefixedProperty.test(property)) {
						renameProperty(this.obj, property, `${current.PREFIX}:${property}`);
					} else if (newProperty.test(property)) {
						renameProperty(this.obj, property, property.replace(newProperty, ''));
					}
				});
		}
		refresh(this);
		return this;
	}

	/**
	 * Get default object vocabulary
	 * @return {Vocabulary}
	 */
	getDefault() {
		return this.vocabularies[0];
	}

	/**
	 * Add vocabulary to object
	 * @param {Vocabulary} vocabulary
	 */
	addVocabulary(vocabulary) {
		this.vocabularies.push(vocabulary);
		refresh(this);
		return this;
	}

	/**
	 * Remove vocabulary to object
	 * @param {Vocabulary} vocabulary
	 */
	removeVocabulary(vocabulary) {
		const found = this.vocabularies.indexOf(vocabulary);
		if (found !== -1) {
			this.vocabularies.splice(found, 1);
			refresh(this);
		}
		return this;
	}

	/**
	 * Add property to context
	 * @param {Record<string,string|object>} property
	 */
	add(property) {
		Object.assign(this.obj['@context'], property);
		return this;
	}

	/**
	 * Remove property from context
	 * @param {Record<string,string|object>} property
	 */
	remove(property) {
		const name = Object.keys(property)[0];
		delete this.obj['@context'][name];
		return this;
	}
}

/**
 * Create a JSON-LD object for a given context
 * @function createObject
 * @param {Vocabulary} vocabulary The default context vocabulary to which the object belongs to
 * @param {Object} [src] The optional source object
 * @returns {ObjectLD} The created JSON-LD object
 * @instance
 */

export const createObject = (vocabulary, src) => {
	const obj = src || {};
	Object.assign(obj, { '@context': {} });
	Object.defineProperties(obj, {
		context: {
			value: new Context(obj).addVocabulary(vocabulary),
			enumerable: false,
			writable: false,
		},
		type: {
			get: function get() {
				return this['@type'];
			},
			set: function set(value) {
				Object.assign(this, { '@type': value });
			},
			enumerable: false,
		},
	});
	const handler = {
		set(obj, property, value) {
			if (!['type', 'context'].includes(property) && typeof value !== 'object') {
				if (!obj[property]) {
					obj[property] = value;
				} else if (obj[property] && !Array.isArray(obj[property]) && obj[property] !== value) {
					obj[property] = [obj[property], value];
				} else {
					obj[property].push(value);
				}
				return true;
			} else {
				return Reflect.set(...arguments);
			}
		},
	};
	const proxy = new Proxy(obj, handler);
	return proxy;
};

/**
 * Test if given object is a JSON-LD object
 * @function isObject
 * @param {Object} obj The source object
 * @param {String} [type] The optional type
 * @returns {Boolean} Whether object is a JSON-LD, optionnaly of the given type
 * @instance
 */

export const isObject = (obj, type) => {
	let isObj = true;
	isObj = isObj && obj['@context'] !== undefined;
	if (type) isObj = isObj && obj['@type'] === type;
	return isObj;
};

/**
 * Map object properties
 * @function mapProperties
 * @param {Object} source The source object
 * @param {Object} target The target object
 * @param {Object} map The properties mapping object
 * @instance
 */

export const mapProperties = (source, target, map) => {
	Object.keys(map)
		.filter((name) => source[name])
		.forEach((name) => {
			if (typeof map[name] === 'object') {
				const [newName, context] = Object.entries(map[name])[0];
				target.context.addVocabulary(context);
				target[`${context.PREFIX}:${newName}`] = source[name];
			} else if (target[map[name]]) {
				// If property is already defined then transform value to an array of values
				if (!Array.isArray(target[map[name]])) Object.assign(target, { [map[name]]: [target[map[name]]] });
				target[map[name]].push(source[name]);
			} else {
				target[map[name]] = source[name];
			}
		});
};

/**
 * Flatten object property subproperties
 * @function flatten
 * @param {Object} obj The source object
 * @param {Object} name The property to flatten
 * @instance
 */

export const flatten = (obj, name) => {
	if (!obj[name]) return;
	Object.keys(obj[name]).forEach((subname) => {
		Object.assign(obj, { [subname]: obj[name][subname] });
	});
	deleteProperty(obj, name);
};
