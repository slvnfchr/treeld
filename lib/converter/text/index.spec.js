import { it } from 'node:test';
import { expect } from 'chai';

import { createObject, schema } from '../context.js';

import { addPhonetisation, PHONETISATION, addRomanisation, ROMANISATION } from './index.js';

export default () => {
	it('Should add predefined or user defined phonetisation variations', () => {
		const propertyName = 'name';
		const propertyValue = 'name value';
		const variationName = 'hangul';
		const variationValue = 'hangul variation value';
		const userDefinedVariationName = 'user defined';
		const userDefinedVariationValue = 'user defined variation value';
		const obj = createObject(schema);
		obj[propertyName] = propertyValue;
		addPhonetisation(obj, propertyName, { [variationName]: variationValue });
		addPhonetisation(obj, propertyName, { [userDefinedVariationName]: userDefinedVariationValue });
		expect(obj[propertyName]).to.be.an('object');
		expect(obj[propertyName]).to.have.all.keys('@none', PHONETISATION[variationName], 'und');
		expect(obj[propertyName]['@none']).to.equal(propertyValue);
		expect(obj[propertyName][PHONETISATION[variationName]]).to.equal(variationValue);
		expect(obj[propertyName].und).to.equal(userDefinedVariationValue);
	});
	it('Should add predefined or user defined romanisation variations', () => {
		const propertyName = 'name';
		const propertyValue = 'name value';
		const variationName = 'pinyin';
		const variationValue = 'pinyin variation value';
		const userDefinedVariationName = 'user defined';
		const userDefinedVariationValue = 'user defined variation value';
		const obj = createObject(schema);
		obj[propertyName] = propertyValue;
		addRomanisation(obj, propertyName, { [variationName]: variationValue });
		addRomanisation(obj, propertyName, { [userDefinedVariationName]: userDefinedVariationValue });
		expect(obj[propertyName]).to.be.an('object');
		expect(obj[propertyName]).to.have.all.keys('@none', ROMANISATION[variationName], 'und-Latn');
		expect(obj[propertyName]['@none']).to.equal(propertyValue);
		expect(obj[propertyName][ROMANISATION[variationName]]).to.equal(variationValue);
		expect(obj[propertyName]['und-Latn']).to.equal(userDefinedVariationValue);
	});
};
