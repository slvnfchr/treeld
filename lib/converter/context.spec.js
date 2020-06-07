
import { createObject, isObject, mapProperties, flatten, schema } from './context';

export default () => {

	it('createObject should create an empty JSON-LD object in given context', (done) => {
		expect(createObject).to.be.instanceof(Function);
		const obj = createObject(schema);
		expect(obj).to.be.instanceof(Object);
		expect(obj).to.have.all.keys('@context');
		expect(obj['@context']).to.have.all.keys('@vocab');
		expect(obj['@context']['@vocab']).to.equal(schema.URI);
		done();
	});

	it('createObject should enhance an given object into a JSON-LD object in given context', (done) => {
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
		done();
	});

	it('JSON-LD object context can be manipulated by adding new vocabulary, removing existing one or change default one with properties name automatic change', (done) => {
		const obj = createObject(schema, { property: 'value' });
		const vocabulary = { URI: 'http://test', PREFIX: 'test' };
		const contextObj = obj['@context'];
		expect(contextObj['@vocab']).to.equal(schema.URI);
		obj.context.add(vocabulary);
		expect(contextObj).to.have.all.keys('@vocab', vocabulary.PREFIX);
		expect(contextObj[vocabulary.PREFIX]).to.equal(vocabulary.URI);
		obj.context.setDefault(vocabulary);
		expect(contextObj['@vocab']).to.equal(vocabulary.URI);
		expect(obj.property).to.be.undefined;
		expect(obj[`${schema.PREFIX}:property`]).not.to.be.undefined;
		expect(contextObj[schema.PREFIX]).to.equal(schema.URI);
		Object.assign(obj, { anotherproperty: 'new value' });
		obj.context.setDefault(schema);
		expect(obj.property).not.to.be.undefined;
		expect(obj.anotherproperty).to.be.undefined;
		expect(obj[`${vocabulary.PREFIX}:anotherproperty`]).not.to.be.undefined;
		obj.context.remove(vocabulary);
		expect(contextObj).to.have.all.keys('@vocab');
		expect(contextObj['@vocab']).to.equal(schema.URI);
		done();
	});

	it('Created object type can be set through type non-enumerable property which is serialized to @type', (done) => {
		expect(createObject).to.be.instanceof(Function);
		const obj = createObject(schema);
		const type = 'type';
		obj.type = type;
		expect(obj.type).to.equal(type);
		expect(obj).to.have.all.keys('@context', '@type');
		expect(obj['@type']).to.equal(type);
		done();
	});

	it('isObject should test if object is a JSON-LD object', (done) => {
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
		done();
	});

	it('mapProperties should rename several properties and merge them into array if applicable', (done) => {
		expect(mapProperties).to.be.instanceof(Function);
		const obj = {
			property1: 'value 1',
			property2: 'value 2',
			property3: 'value 3',
		};
		mapProperties(obj, {
			property1: 'newProperty1',
			property2: 'newProperty2',
			property3: 'newProperty2',
			property4: 'newProperty3',
		});
		expect(obj).to.have.all.keys('newProperty1', 'newProperty2');
		expect(obj.newProperty1).to.equal('value 1');
		expect(obj.newProperty2).to.have.members(['value 2', 'value 3']);
		done();
	});

	it('flatten should apply properties subproperties to object', (done) => {
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
		done();
	});

};
