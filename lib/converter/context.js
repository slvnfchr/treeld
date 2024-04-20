import * as schema from './context/schema.js';
import * as bio from './context/bio.js';
import * as rdfs from './context/rdfs.js';
import * as dc from './context/dc.js';
import * as dcmitype from './context/dcmitype.js';
import { renameProperty, deleteProperty } from './utils.js';

export { schema, bio, rdfs, dc, dcmitype };

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
 * @type {Class}
 * @instance
 */

export class Context {
	constructor(obj) {
		Object.defineProperties(this, {
			obj: {
				value: obj,
				enumerable: false,
				writable: false,
			},
			vocabularies: {
				value: [],
				enumerable: false,
				writable: false,
			},
		});
	}

	setDefault(vocabulary) {
		const current = this.vocabularies[0];
		const found = this.vocabularies.indexOf(vocabulary);
		if (found > 0) this.vocabularies.splice(found, 1);
		this.vocabularies.unshift(vocabulary);
		if (current !== vocabulary) {
			const prefixedProperty = new RegExp('^[^:]+:.*');
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

	getDefault() {
		return this.vocabularies[0];
	}

	add(vocabulary) {
		this.vocabularies.push(vocabulary);
		refresh(this);
		return this;
	}

	remove(vocabulary) {
		const found = this.vocabularies.indexOf(vocabulary);
		if (found !== -1) {
			this.vocabularies.splice(found, 1);
			refresh(this);
		}
		return this;
	}
}

/**
 * Create a JSON-LD object for a given context
 * @function mapObject
 * @param {Object} vocabulary The default context vocabulary to which the object belongs to
 * @param [Object] src The optional source object
 * @returns {Object} The created JSON-LD object
 * @instance
 */

export const createObject = (vocabulary, src) => {
	const obj = src || {};
	Object.assign(obj, { '@context': {} });
	Object.defineProperties(obj, {
		context: {
			value: new Context(obj).add(vocabulary),
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
	return obj;
};

/**
 * Test if given object is a JSON-LD object
 * @function isObject
 * @param {Object} obj The source object
 * @param [String] type The optional type
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
 * @param {Object} obj The source object
 * @param {Object} map The properties mapping object
 * @instance
 */

export const mapProperties = (obj, map) => {
	Object.keys(map)
		.filter((name) => obj[name])
		.forEach((name) => {
			if (typeof map[name] === 'object') {
				const [newName, context] = Object.entries(map[name])[0];
				obj.context.add(context);
				renameProperty(obj, name, `${context.PREFIX}:${newName}`);
			} else if (obj[map[name]]) {
				// If property is already defined then transform value to an array of values
				if (!Array.isArray(obj[map[name]])) Object.assign(obj, { [map[name]]: [obj[map[name]]] });
				obj[map[name]].push(obj[name]);
				deleteProperty(obj, name);
			} else {
				renameProperty(obj, name, map[name]);
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
