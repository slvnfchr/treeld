import Interval from './interval';

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
const DATE_RE_PARTS = '0'.match(DATE_RE).length - 1;

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
 * Approximated date regular expression
 * @const APPROX
 * @private
 */

const APPROX = String.raw`(${Object.keys(QUALIFICATIONS).join('|')})\s(${DATE})`;
const APPROX_RE = createRegexp(APPROX);

/**
 * Date period regular expression
 * @const PERIOD
 * @private
 */

const PERIOD = String.raw`(FROM\s(${DATE}))?(\s?TO\s(${DATE}))?`;
const PERIOD_RE = createRegexp(PERIOD);

/**
 * Date range regular expression
 * The date range differs from the date period in that the date range is an estimate that an event happened on a single date somewhere in the date range specified.
 * @const RANGE
 * @private
 */

const RANGE = String.raw`(BEF|AFT|BET)\s(${DATE})(\sAND\s(${DATE}))?`;
const RANGE_RE = createRegexp(RANGE);

/**
 * Date range mapping
 * @const RANGES
 * @private
 */

const RANGES = {
	BEF: [null, 1],
	AFT: [1, null],
	BET: [1, 1 + DATE_RE_PARTS + 2],
};

/**
 * Interpreted date regular expression
 * @const RANGE
 * @private
 */

const INT = String.raw`^INT\s(${DATE})\s\(([^\)]+)\)?$`;
const INT_RE = createRegexp(INT);

/**
 * Date and time combination object
 * @const Datetime
 * @type {Class}
 * @instance
 */

export class DateTime {
	constructor({ day, month, year, calendar }) {
		this.day = day;
		this.month = month;
		this.year = year;
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
			date.setUTCHours(0, 0, 0, 0);
			if (this.hours) date.setUTCHours(this.hours, this.minutes);
			str = date.toISOString();
			if (!this.hours) str = str.replace('T00:00:00.000Z', '');
		}
		return `${str}${this.qualification ? QUALIFICATIONS[this.qualification] : ''}`;
	}
}

/**
 * @function parse
 * @param {String} str The GEDCOM date record
 * @returns {Object} The DateTime or Interval object corresponding to record
 * @instance
 */

export const parse = (str) => {
	// Approximated date
	if (APPROX_RE.test(str)) {
		const parts = str.match(APPROX_RE);
		const date = DateTime.parse(parts[2]);
		date.qualification = parts[1]; // eslint-disable-line prefer-destructuring
		return date;
	}
	// Range
	if (RANGE_RE.test(str)) {
		const parts = str.match(RANGE_RE);
		const interval = RANGES[parts[1]].map((index) => (index ? parts[index + 1] : undefined));
		const start = DateTime.parse(interval[0]);
		const end = DateTime.parse(interval[1]);
		return new Interval({ start, end });
	}
	// Period
	if (PERIOD_RE.test(str)) {
		const parts = str.match(PERIOD_RE);
		const start = DateTime.parse(parts[2]);
		const end = DateTime.parse(parts[2 + DATE_RE_PARTS + 2]);
		const interval = new Interval({ start, end });
		interval.period = true;
		return interval;
	}
	// Interpreted
	if (INT_RE.test(str)) {
		const parts = str.match(INT_RE);
		const date = DateTime.parse(parts[1]);
		date.description = parts[1 + DATE_RE_PARTS + 1];
		return date;
	}
	// Exact date
	if (DATE_RE.test(str)) {
		return DateTime.parse(str);
	}
	return null;
};
