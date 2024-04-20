import { parse } from './date/datetime.js';

/**
 * Date property transformer
 * @type {Function}
 * @param {Object} data The data object to transform
 * @param {String} property The target object property to transform
 * @returns {Object} The data object with the transformed property if applicable
 * @instance
 */

export default (data, property) => {
	if (property !== 'DATE') return data;
	const date = data[property];
	// Simple date
	if (typeof date === 'string') {
		const d = parse(date);
		return Object.assign(data, { [property]: d.toISOString() });
	}
	// Date with time subproperty
	const d = parse(date['@value']);
	const time = date.TIME.match(/^([0-9]+):([0-9]+)/i);
	d.hours = time[1]; // eslint-disable-line prefer-destructuring
	d.minutes = time[2]; // eslint-disable-line prefer-destructuring
	return Object.assign(data, { [property]: d.toISOString() });
};
