
/**
 * Date interval object
 * @const Interval
 * @type {Class}
 * @instance
 */

export default class Interval {

	constructor({ start, end }) {
		this.start = start;
		this.end = end;
		this.period = false;
	}

	toISOString() {
		return `${this.start ? this.start.toISOString() : '..'}/${this.end ? this.end.toISOString() : '..'}`;
	}

}
