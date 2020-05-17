
/**
 * Context id
 * @const CONTEXT
 * @private
 */

const CONTEXT = 'http://schema.org';

/**
 * Object types
 * @const TYPES
 * @instance
 */

export const TYPES = {
	PLACE: 'Place',
	ADDRESS: 'PostalAddress',
};

/**
 * Create schema.org based object
 * @function mapObject
 * @param [Object] src The optional source object
 * @returns {Object} The object with schema.org properties
 * @instance
 */

export const createObject = (src) => {
	const obj = src || {};
	Object.defineProperties(obj, {
		'@context': {
			value: CONTEXT,
			enumerable: true,
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
 * Test if given object is a schema.org based object
 * @function isObject
 * @param {Object} obj The optional source object
 * @returns {Boolean} Whether object with schema.org properties
 * @instance
 */

export const isObject = (obj, type) => {
	let isObj = true;
	isObj = isObj && obj['@context'] === CONTEXT;
	if (type) isObj = isObj && obj['@type'] === type;
	return isObj;
};
