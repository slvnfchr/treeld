import { it } from 'node:test';
import { expect } from 'chai';

import DateTime from './datetime.js';
import Interval from './interval.js';
import { parse, CALENDAR } from './index.js';

export default () => {
	it('Exact date', () => {
		const conversions = {
			'1791': { iso: '1791', name: '1791' }, // eslint-disable-line quote-props
			'DEC 1791': { iso: '1791-12', name: 'December 1791' },
			'26 DEC 1791': { iso: '1791-12-26', name: '26 December 1791' },
		};
		Object.entries(conversions).forEach(([key, value]) => {
			const obj = parse(key);
			expect(obj).to.be.instanceof(DateTime);
			expect(obj).to.have.all.keys('day', 'month', 'year', 'hours', 'minutes', 'seconds', 'milliseconds', 'calendar');
			expect(obj.calendar).to.deep.equal(CALENDAR.GREGORIAN);
			expect(obj.toISOString()).to.equal(value.iso);
			expect(obj.toString()).to.equal(value.name);
		});
	});

	it('Calendars detection', () => {
		const conversions = {
			GREGORIAN: '@#DGREGORIAN@ 18 OCT 1871',
			JULIAN: '@#DJULIAN@ 8 OCT 1871',
			HEBREW: '@#DHEBREW@ 3 CSH 5632',
			HIJRI: '@#DHIJRI@ 3 SHAAB 1288',
			FRENCH: '@#DFRENCH R@ 26 VEND 80',
		};
		Object.entries(conversions).forEach(([key, value]) => {
			const obj = parse(value);
			expect(obj).to.be.instanceof(DateTime);
			expect(obj.calendar).to.deep.equal(CALENDAR[key]);
		});
	});

	it('Aproximated date', () => {
		const conversions = {
			'ABT 1791': '1791?',
			'ABT DEC 1791': '1791-12?',
			'ABT 26 DEC 1791': '1791-12-26?',
			'CAL 1791': '1791~',
			'CAL DEC 1791': '1791-12~',
			'CAL 26 DEC 1791': '1791-12-26~',
			'EST 1791': '1791%',
			'EST DEC 1791': '1791-12%',
			'EST 26 DEC 1791': '1791-12-26%',
		};
		Object.entries(conversions).forEach(([key, value]) => {
			const obj = parse(key);
			expect(obj).to.be.instanceof(DateTime);
			expect(obj.toISOString()).to.equal(value);
		});
	});

	it('Range', () => {
		const conversions = {
			'BEF 1791': '../1791',
			'BEF DEC 1791': '../1791-12',
			'BEF 26 DEC 1791': '../1791-12-26',
			'AFT 1791': '1791/..',
			'AFT DEC 1791': '1791-12/..',
			'AFT 26 DEC 1791': '1791-12-26/..',
			'BET 1791 AND 1871': '1791/1871',
			'BET DEC 1791 AND OCT 1871': '1791-12/1871-10',
			'BET 26 DEC 1791 AND 18 OCT 1871': '1791-12-26/1871-10-18',
		};
		Object.entries(conversions).forEach(([key, value]) => {
			const obj = parse(key);
			expect(obj).to.be.instanceof(Interval);
			expect(obj).to.have.all.keys('start', 'end', 'period');
			expect(obj.period).to.be.false;
			expect(obj.toISOString()).to.equal(value);
		});
	});

	it('Period', () => {
		const conversions = {
			'FROM 1791': '1791/..',
			'FROM DEC 1791': '1791-12/..',
			'FROM 26 DEC 1791': '1791-12-26/..',
			'TO 1791': '../1791',
			'TO DEC 1791': '../1791-12',
			'TO 26 DEC 1791': '../1791-12-26',
			'FROM 1791 TO 1871': '1791/1871',
			'FROM DEC 1791 TO OCT 1871': '1791-12/1871-10',
			'FROM 26 DEC 1791 TO 18 OCT 1871': '1791-12-26/1871-10-18',
		};
		Object.entries(conversions).forEach(([key, value]) => {
			const obj = parse(key);
			expect(obj).to.be.instanceof(Interval);
			expect(obj.period).to.be.true;
			expect(obj.toISOString()).to.equal(value);
		});
	});

	it('Interpreted date', () => {
		const date = '26 DEC 1791';
		const phrase = 'Charles Babbage birth date';
		const obj = parse(`INT ${date} (${phrase})`);
		expect(obj).to.be.instanceof(DateTime);
		expect(obj.toISOString()).to.equal('1791-12-26');
		expect(obj.description).to.equal(phrase);
	});

	it('Date with time', () => {
		const date = '26 DEC 1791';
		const time = '08:30:10.00';
		const obj = parse(date);
		obj.setTime(time);
		expect(obj).to.be.instanceof(DateTime);
		expect(obj.toISOString()).to.equal('1791-12-26T08:30:10.000Z');
		obj.setTime('invalid time');
		expect(obj.toISOString()).to.equal('1791-12-26');
	});
};
