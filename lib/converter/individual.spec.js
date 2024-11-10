import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { INDIVIDUAL, NAME } from '../gedcom.js';
import { isObject, schema, rdfs, foaf } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Person record should be converted to Person schema.org object', async () => {
		const src = { '@type': INDIVIDUAL };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PERSON)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type');
		}
	});

	it('Person record with name should have expected properties', async () => {
		const givenName = 'Charles';
		const familyName = 'Babbage';
		const name = `${givenName} /${familyName}/`;
		const src = { '@type': INDIVIDUAL, 'NAME': name };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'givenName', 'familyName');
			expect(obj.name).to.equal(`${givenName} ${familyName}`);
			expect(obj.givenName).to.equal(givenName);
			expect(obj.familyName).to.equal(familyName);
		}
	});

	it('Person record with name pieces should have expected properties', async () => {
		const namePrefix = 'Dr.';
		const givenName = 'John';
		const familyNamePrefix = 'von';
		const familyName = 'Neumann';
		const nameSuffix = 'PhD';
		const nameValue = `${givenName} /${familyNamePrefix} ${familyName}/`;
		const name = { '@type': NAME, '@value': nameValue, 'NPFX': namePrefix, 'GIVN': givenName, 'SPFX': familyNamePrefix, 'SURN': familyName, 'NSFX': nameSuffix };
		const src = { '@type': INDIVIDUAL, 'NAME': name };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'honorificPrefix', 'givenName', 'familyName', 'honorificSuffix');
			expect(obj.name).to.equal(`${obj.honorificPrefix} ${obj.givenName} ${obj.familyName}, ${obj.honorificSuffix}`);
			expect(obj.honorificPrefix).to.equal(namePrefix);
			expect(obj.givenName).to.equal(givenName);
			expect(obj.familyName).to.equal(`${familyNamePrefix} ${familyName}`);
			expect(obj.honorificSuffix).to.equal(nameSuffix);
		}
	});

	it('Person record with nickname should have expected properties and context', async () => {
		const givenName = 'Frances Elizabeth';
		const nickname = 'Fran';
		const familyName = 'Allen';
		const name = { '@type': NAME, 'GIVN': givenName, 'NICK': nickname, 'SURN': familyName };
		const src = { '@type': INDIVIDUAL, 'NAME': name };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.context.vocabularies).to.deep.include(foaf);
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'givenName', 'foaf:nick', 'familyName');
			expect(obj.name).to.equal(`${obj.givenName} "${obj['foaf:nick']}" ${obj.familyName}`);
			expect(obj.givenName).to.equal(givenName);
			expect(obj['foaf:nick']).to.equal(nickname);
			expect(obj.familyName).to.equal(familyName);
		}
	});

	it('Person record with name type should have expected properties', async () => {
		const givenName = 'Frances Elizabeth';
		const familyName = 'Snyder';
		let name = { '@type': NAME, 'TYPE': 'birth', 'GIVN': givenName, 'SURN': familyName };
		let src = { '@type': INDIVIDUAL, 'NAME': name };
		let data = createStreamFromObject(src);
		let converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.context.vocabularies).to.deep.include(rdfs);
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'givenName', 'familyName', 'rdfs:comment');
			expect(obj['rdfs:comment']).to.equal('Name given at or near birth');
		}
		name = { '@type': NAME, 'TYPE': 'other', 'GIVN': givenName, 'SURN': familyName };
		src = { '@type': INDIVIDUAL, 'NAME': name };
		data = createStreamFromObject(src);
		converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj.context.vocabularies).to.deep.include(rdfs);
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'givenName', 'familyName', 'rdfs:comment');
			expect(obj['rdfs:comment']).to.equal(name.TYPE);
		}
	});
};
