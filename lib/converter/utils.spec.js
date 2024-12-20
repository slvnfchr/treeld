import { it } from 'node:test';
import { expect } from 'chai';

import { mapObject, noop } from './utils.js';

export default () => {
	it('Should apply mapping according to map object', () => {
		const source = {
			property1: 'value 1',
			property2: 'value 2',
			property3: 'value 3',
			property4: 'value 4',
			property5: ['subvalue 1', 'subvalue 2'],
		};
		const target = {};
		const error = new Error('mapping error');
		const map = {
			property1: (val) => (target.propertyA = val),
			property2: (val) => (target.propertyB = val.toUpperCase()),
			property3: () => {
				throw error;
			},
			property5: (val) => {
				if (!target.propertyC) target.propertyC = [];
				target.propertyC.push(val.toUpperCase());
			},
		};
		const result = mapObject(source, map);
		expect(target).to.have.all.keys('propertyA', 'propertyB', 'propertyC');
		expect(target.propertyA).to.equal(source.property1);
		expect(target.propertyB).to.equal(source.property2.toUpperCase());
		expect(target.propertyC).to.deep.equal([source.property5[0].toUpperCase(), source.property5[1].toUpperCase()]);
		expect(result).to.have.all.keys('error', 'info');
		expect(result.error.message).to.contain('property3');
		expect(result.info).to.contain('property4');
	});
	it('Should apply no conversion', () => {
		const source = {
			property1: 'value 1',
			property2: 'value 2',
		};
		const result = noop(source);
		expect(result).to.have.all.keys('value');
		expect(result.value).to.deep.equal(source);
	});
};
