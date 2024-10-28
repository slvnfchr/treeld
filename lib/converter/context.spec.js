import { it } from 'node:test';
import { expect } from 'chai';

import { createObject, isObject, mapProperties, flatten, schema } from './context.js';

export default () => {
	it('createObject should create an empty JSON-LD object in given context', () => {
		expect(createObject).to.be.instanceof(Function);
		const obj = createObject(schema);
		expect(obj).to.be.instanceof(Object);
		expect(obj).to.have.all.keys('@context');
		expect(obj['@context']).to.have.all.keys('@vocab');
		expect(obj['@context']['@vocab']).to.equal(schema.URI);
	});

	it('createObject should enhance an given object into a JSON-LD object in given context', () => {
		expect(createObject).to.be.instanceof(Function);
		const property = 'property';
		const value = 'value';
		const src = { [property]: value };
		const obj = createObject(schema, src);
		expect(obj).to.equal(src);
		expect(obj).to.have.all.keys('@context', property);
		expect(obj['@context']).to.have.all.keys('@vocab');
		expect(obj['@context']['@vocab']).to.equal(schema.URI);
		expect(obj[property]).to.equal(value);
	});

	it('JSON-LD object context can be manipulated by adding new vocabulary, removing existing one or change default one with properties name automatic change', () => {
		const obj = createObject(schema, { property: 'value' });
		const vocabulary = { URI: 'http://test', PREFIX: 'test' };
		const contextObj = obj['@context'];
		expect(obj.context.getDefault()).to.equal(schema);
		expect(contextObj['@vocab']).to.equal(schema.URI);
		obj.context.addVocabulary(vocabulary);
		expect(contextObj).to.have.all.keys('@vocab', vocabulary.PREFIX);
		expect(contextObj[vocabulary.PREFIX]).to.equal(vocabulary.URI);
		expect(obj.context.getDefault()).to.equal(schema);
		obj.context.setDefault(vocabulary);
		expect(contextObj['@vocab']).to.equal(vocabulary.URI);
		expect(obj.context.getDefault()).to.equal(vocabulary);
		expect(obj.property).to.be.undefined;
		expect(obj[`${schema.PREFIX}:property`]).not.to.be.undefined;
		expect(contextObj[schema.PREFIX]).to.equal(schema.URI);
		Object.assign(obj, { anotherproperty: 'new value' });
		obj.context.setDefault(schema);
		expect(obj.property).not.to.be.undefined;
		expect(obj.anotherproperty).to.be.undefined;
		expect(obj[`${vocabulary.PREFIX}:anotherproperty`]).not.to.be.undefined;
		obj.context.removeVocabulary(vocabulary);
		expect(obj.context.getDefault()).to.equal(schema);
		expect(contextObj).to.have.all.keys('@vocab');
		expect(contextObj['@vocab']).to.equal(schema.URI);
	});

	it('JSON-LD object context can be manipulated by adding new property', () => {
		const obj = createObject(schema, { property: 'value' });
		const propertyName = 'name';
		const propertyValue = { '@value': 'value ' };
		const property = { [propertyName]: propertyValue };
		const contextObj = obj['@context'];
		obj.context.add(property);
		expect(contextObj[propertyName]).to.equal(propertyValue);
		obj.context.remove(property);
		expect(contextObj[propertyName]).to.be.undefined;
	});

	it('Created object type can be set through type non-enumerable property which is serialized to @type', () => {
		expect(createObject).to.be.instanceof(Function);
		const obj = createObject(schema);
		const type = 'type';
		obj.type = type;
		expect(obj.type).to.equal(type);
		expect(obj).to.have.all.keys('@context', '@type');
		expect(obj['@type']).to.equal(type);
	});

	it('isObject should test if object is a JSON-LD object', () => {
		expect(isObject).to.be.instanceof(Function);
		const obj = createObject(schema);
		expect(isObject(obj)).to.be.true;
		const src = {};
		expect(isObject(src)).to.be.false;
		createObject(schema, src);
		expect(isObject(src)).to.be.true;
		const type = 'SpecificType';
		src.type = type;
		expect(isObject(src, type)).to.be.true;
	});

	it('mapProperties should rename several properties and merge them into array if applicable', () => {
		expect(mapProperties).to.be.instanceof(Function);
		const source = {
			property1: 'value 1',
			property2: 'value 2',
			property3: 'value 3',
		};
		const target = {};
		mapProperties(source, target, {
			property1: 'newProperty1',
			property2: 'newProperty2',
			property3: 'newProperty2',
			property4: 'newProperty3',
		});
		expect(target).to.have.all.keys('newProperty1', 'newProperty2');
		expect(target.newProperty1).to.equal('value 1');
		expect(target.newProperty2).to.have.members(['value 2', 'value 3']);
	});

	it('flatten should apply properties subproperties to object', () => {
		expect(flatten).to.be.instanceof(Function);
		const obj = {
			property1: 'value 1',
			property2: {
				subproperty1: 'subvalue 1',
				subproperty2: { attribute: 'value' },
			},
		};
		flatten(obj, 'property2');
		expect(obj).to.have.all.keys('property1', 'subproperty1', 'subproperty2');
		expect(obj.subproperty1).to.equal('subvalue 1');
		expect(obj.subproperty2).to.deep.equal({ attribute: 'value' });
	});
};
