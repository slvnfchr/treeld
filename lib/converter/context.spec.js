
import { createObject, isObject, schema } from './context';

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

};
