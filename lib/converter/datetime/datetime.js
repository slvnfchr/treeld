/**
 * Search array to find given element index, return null otherwise
 * @function findIndex
 * @private
 */

const findIndex = (arr, obj) => {
	const index = arr.indexOf(obj);
	return index !== -1 ? index : null;
};

/**
 * Regular expression instantiation from string
 * @function createRegexp
 * @private
 */

const createRegexp = (str) => new RegExp(`^${str}$`, 'i');

/**
 * Gregorian/Julien calendar months
 * @const MONTHS
 * @private
 */

const MONTHS = {
	JAN: 'January',
	FEB: 'Fabruary',
	MAR: 'March',
	APR: 'April',
	MAY: 'May',
	JUN: 'June',
	JUL: 'July',
	AUG: 'August',
	SEP: 'September',
	OCT: 'October',
	NOV: 'November',
	DEC: 'December',
};

/**
 * Hebrew calendar months
 * @const MONTHS_HEBREW
 * @private
 */

const MONTHS_HEBREW = {
	TSH: 'Tishri',
	CSH: 'Cheshvan',
	KSL: 'Kislev',
	TVT: 'Tevet',
	SHV: 'Shevat',
	ADR: 'Adar',
	ADS: 'Adar Sheni',
	NSN: 'Nisan',
	IYR: 'Iyar',
	SVN: 'Sivan',
	TMZ: 'Tammuz',
	AAV: 'Av',
	ELL: 'Elul',
};

/**
 * Islamic calendar months
 * @const MONTHS_HIJRI
 * @private
 */

const MONTHS_HIJRI = {
	MUHAR: 'Muḥarram',
	SAFAR: 'Ṣafar',
	RABIA: 'Rabīʿ al-Awwal',
	RABIT: 'Rabīʿ al-Thānī',
	JUMAA: 'Jumādá al-Ūlá',
	JUMAT: 'Jumādá al-Ākhirah',
	RAJAB: 'Rajab',
	SHAAB: 'Sha‘bān',
	RAMAD: 'Ramaḍān',
	SHAWW: 'Shawwāl',
	DHUAQ: 'Dhū al-Qa‘dah',
	DHUAH: 'Dhū al-Ḥijjah',
};

/**
 * French revolution calendar months
 * @const MONTHS_FRENCH
 * @private
 */

const MONTHS_FRENCH = {
	VEND: 'Vendemaire',
	BRUM: 'Brumaire',
	FRIM: 'Frimaire',
	NIVO: 'Nivose',
	PLUV: 'Pluviose',
	VENT: 'Ventose',
	GERM: 'Germinal',
	FLOR: 'Floréal',
	PRAI: 'Prairial',
	MESS: 'Messidor',
	THER: 'Thermidor',
	FRUC: 'Fructidor',
	COMP: 'Complementaire',
};

/**
 * Supported calendars
 * @const CALENDAR
 * @instance
 */

export const CALENDAR = {
	GREGORIAN: { escape: '@#DGREGORIAN@', months: MONTHS },
	JULIAN: { escape: '@#DJULIAN@', months: MONTHS },
	HEBREW: { escape: '@#DHEBREW@', months: MONTHS_HEBREW },
	HIJRI: { escape: '@#DHIJRI@', months: MONTHS_HIJRI },
	FRENCH: { escape: String.raw`@#DFRENCH\s?R@`, months: MONTHS_FRENCH },
};
Object.keys(CALENDAR).forEach((c) => Object.assign(CALENDAR[c], { re: createRegexp(CALENDAR[c].escape) }));

/**
 * Date regular expression base string (with calendar escapes)
 * @const DATE
 * @private
 */

const DATE = String.raw`((${Object.values(CALENDAR)
	.map((c) => c.escape)
	.join('|')})\s)?(([0-9]{1,2})\s)?(([A-Z]{3,5})\s)?([0-9]+)(\S)?`;
const DATE_RE = createRegexp(DATE);

/**
 * Date qualifications
 * @const QUALIFICATIONS
 * @private
 */

const QUALIFICATIONS = {
	ABT: '?', // About, meaning the date is not exact (uncertain)
	CAL: '~', // Calculated mathematically, for example, from an event date and age (approximate)
	EST: '%', // Estimated based on an algorithm using some other event date (uncertain and approximate)
};

/**
 * Time regular expression
 * @const TIME_RE
 * @private
 */

const TIME_RE = /^([0-9]{1,2}):([0-9]{2})(:(([0-9]{2})(\.([0-9]{2}))?))?/i;

/**
 * Time string parser
 * @type {Function}
 * @param {String} time The GEDCOM time record
 * @returns {Object} The object with time components if applicable
 * @private
 */

const parseTime = (time) => {
	const t = time.match(TIME_RE) || ['0', '00', '00.00'];
	return { hours: parseInt(t[1], 10), minutes: parseInt(t[2], 10), seconds: parseFloat(t[4]) || 0 };
};

/**
 * Date and time combination object
 * @const Datetime
 * @type {Class}
 * @instance
 */

export default class DateTime {
	constructor({ day, month, year, calendar }) {
		this.day = day;
		this.month = month;
		this.year = year;
		this.hours = 0;
		this.minutes = 0;
		this.seconds = 0;
		this.milliseconds = 0;
		this.calendar = calendar;
	}

	static parse(str) {
		if (DATE_RE.test(str)) {
			const parts = str.match(DATE_RE);
			const calendar = Object.keys(CALENDAR).reduce((found, key) => {
				if (CALENDAR[key].re.test(parts[2])) return CALENDAR[key];
				return found;
			}, CALENDAR.GREGORIAN);
			const day = parseInt(parts[4], 10) || null;
			const month = findIndex(Object.keys(calendar.months), parts[6]);
			const year = parseInt(parts[7], 10);
			// TODO any conversion to gregorian calendar with given timezone if needed
			return new DateTime({ day, month, year, calendar });
		}
		return null;
	}

	setTime(time) {
		const { hours, minutes, seconds } = parseTime(time);
		this.hours = hours;
		this.minutes = minutes;
		this.seconds = Math.floor(seconds);
		this.milliseconds = (seconds - Math.floor(seconds)) * 1000;
	}

	toString() {
		const str = [];
		if (Number.isInteger(this.day)) str.push(this.day);
		if (Number.isInteger(this.month)) str.push(Object.values(this.calendar.months)[this.month]);
		str.push(this.year);
		return str.join(' ');
	}

	toISOString() {
		let str;
		if (!this.month && !this.day) {
			str = this.year;
		} else if (!this.day) {
			const month = `${this.month + 1}`.padStart(2, '0');
			str = `${this.year}-${month}`;
		} else {
			const date = new Date();
			date.setUTCFullYear(this.year);
			date.setUTCMonth(this.month);
			date.setUTCDate(this.day);
			date.setUTCHours(this.hours, this.minutes, this.seconds, this.milliseconds);
			str = date.toISOString();
			if (!this.hours) str = str.replace('T00:00:00.000Z', '');
		}
		return `${str}${this.qualification ? QUALIFICATIONS[this.qualification] : ''}`;
	}
}
