
import * as schema from './context/schema';
import { renameProperty } from './utils';

export { schema };

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
		.filter(([key, value]) => ((URIs.indexOf(value) === -1) || (value === defaultVocabulary && key !== '@vocab') || (value !== defaultVocabulary && key === '@vocab')))
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
			Object.keys(this.obj).filter((property) => !/^@/i.test(property)).forEach((property) => {
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
			value: (new Context(obj)).add(vocabulary),
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
