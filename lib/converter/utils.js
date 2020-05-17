
/**
 * Object utility functions
 * @module
 */

/**
 * Map object properties
 * @function mapObject
 * @param {Object} src The source object
 * @param {Object} map The properties mapping
 * @returns {Object} An object with mapped properties
 * @instance
 */

export const mapObject = (src, map) => Object.keys(map).filter((key) => src[map[key]] !== undefined).reduce((obj, key) => Object.assign(obj, { [key]: src[map[key]] }), {});

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
