/**
 * Object utility functions
 * @module
 */

/**
 * Map object properties
 * @function mapObject
 * @param {Object} src The source object
 * @param {Record<string, Function>} map The properties mapping
 * @returns {Object<string, Object>} Mapped properties
 * @instance
 */

export const mapObject = (src, map) => {
	const errors = Object.keys(map)
		.filter((key) => typeof src[key] !== 'undefined')
		.reduce((obj, name) => {
			try {
				map[name](src[name]);
			} catch (e) {
				obj[name] = e;
			}
			return obj;
		}, {});
	const error = Object.keys(errors).length && new Error(`The following properties conversion fail: ${Object.keys(errors).join(', ')}`);
	const ignore = Object.keys(src)
		.filter((name) => !/^_/.test(name)) // extension tags
		.filter((name) => !map[name]);
	const info = ignore.length && `The ${ignore.join(', ')} properties were not converted for ${src['@type']} object`;
	return { ...(info && { info }), ...(error && { error }) };
};
/**
 * Converter with no transformation
 * @function noop
 * @param {Object} obj The source object
 * @returns {import('./types.ts').ConversionResult<Object>} The input object
 * @instance
 */

export const noop = (obj) => ({ value: obj });

/**
 * Delete an object property
 * @function deleteProperty
 * @param {Object} obj The source object
 * @param {Object} name The property to delete
 * @instance
 */

export const deleteProperty = (obj, name) => {
	delete obj[name]; // eslint-disable-line  no-param-reassign
};

/**
 * Rename object property
 * @function renameProperty
 * @param {Object} obj The source object
 * @param {Object} name The property name
 * @param {Object} newName The new property name
 * @instance
 */

export const renameProperty = (obj, name, newName) => {
	Object.assign(obj, { [newName]: obj[name] });
	deleteProperty(obj, name);
};
