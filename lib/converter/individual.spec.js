import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { INDIVIDUAL, NAME } from '../gedcom.js';
import { isObject, schema, rdfs, bio, foaf } from './context.js';
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

	it('Person record with gender should have expected properties', async () => {
		let src = { '@type': INDIVIDUAL, 'SEX': 'U' };
		let data = createStreamFromObject(src);
		let converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('@context', '@type');
		}
		src = {
			[`${schema.URI}/Female`]: { '@type': INDIVIDUAL, 'SEX': 'F' },
			[`${schema.URI}/Male`]: { '@type': INDIVIDUAL, 'SEX': 'M' },
			'Intersex': { '@type': INDIVIDUAL, 'SEX': 'X' },
			'Not recorded': { '@type': INDIVIDUAL, 'SEX': 'N' },
		};
		data = createStreamFromObject(Object.values(src));
		converter = new Converter();
		let count = 0;
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('@context', '@type', 'gender');
			expect(obj.gender).to.equal(Object.keys(src)[count]);
			count += 1;
		}
	});

	it('Person record with occupation should have expected properties', async () => {
		const name = 'Margaret /Hamilton/';
		const occupation = 'Software Engineer';
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'OCCU': occupation };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('hasOccupation');
			expect(obj.hasOccupation).to.have.all.keys('@context', '@type', 'name');
			expect(obj.hasOccupation['@type']).to.equal('Occupation');
			expect(obj.hasOccupation.name).to.equal(occupation);
		}
	});

	it('Person record with past occupation during a given period should have expected properties', async () => {
		const name = 'Margaret /Hamilton/';
		const occupation = 'Software Engineer';
		const date = `FROM 1965 TO 1976`;
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'OCCU': { '@value': occupation, 'DATE': date } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('hasOccupation');
			expect(obj.hasOccupation['@type']).to.equal('Role');
			expect(obj.hasOccupation.startDate).to.equal('1965');
			expect(obj.hasOccupation.endDate).to.equal('1976');
			expect(obj.hasOccupation.hasOccupation).to.have.all.keys('@context', '@type', 'name');
			expect(obj.hasOccupation.hasOccupation['@type']).to.equal('Occupation');
			expect(obj.hasOccupation.hasOccupation.name).to.equal(occupation);
		}
	});

	it('Person record with past occupation during a date range should have expected properties', async () => {
		const name = 'Margaret /Hamilton/';
		const occupation = 'Director of the Software Engineering Division';
		const date = `BEF 1976`;
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'OCCU': { '@value': occupation, 'DATE': date } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('hasOccupation');
			expect(obj.hasOccupation['@type']).to.equal('Role');
			expect(obj.hasOccupation.startDate).to.equal('../1976');
			expect(obj.hasOccupation.hasOccupation).to.have.all.keys('@context', '@type', 'name');
			expect(obj.hasOccupation.hasOccupation['@type']).to.equal('Occupation');
			expect(obj.hasOccupation.hasOccupation.name).to.equal(occupation);
		}
	});

	it('Person record with several past occupations should have expected properties', async () => {
		const name = 'Margaret /Hamilton/';
		const occupation1 = 'Software Engineer';
		const date1 = `FROM 1965 TO 1976`;
		const occupation2 = 'Director of the Software Engineering Division';
		const date2 = `BEF 1976`;
		const src = {
			'@type': INDIVIDUAL,
			'NAME': name,
			'OCCU': [
				{ '@value': occupation1, 'DATE': date1 },
				{ '@value': occupation2, 'DATE': date2 },
			],
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('hasOccupation');
			expect(obj.hasOccupation).to.be.an('array');
			expect(obj.hasOccupation[0]['@type']).to.equal('Role');
			expect(obj.hasOccupation[0].startDate).to.equal('1965');
			expect(obj.hasOccupation[0].endDate).to.equal('1976');
			expect(obj.hasOccupation[0].hasOccupation).to.have.all.keys('@context', '@type', 'name');
			expect(obj.hasOccupation[0].hasOccupation['@type']).to.equal('Occupation');
			expect(obj.hasOccupation[0].hasOccupation.name).to.equal(occupation1);
			expect(obj.hasOccupation[1]['@type']).to.equal('Role');
			expect(obj.hasOccupation[1].startDate).to.equal('../1976');
			expect(obj.hasOccupation[1].hasOccupation).to.have.all.keys('@context', '@type', 'name');
			expect(obj.hasOccupation[1].hasOccupation['@type']).to.equal('Occupation');
			expect(obj.hasOccupation[1].hasOccupation.name).to.equal(occupation2);
		}
	});

	it('Person record with birth individual event should have expected properties', async () => {
		const name = 'Augusta Ada /Byron/';
		const date = `10 DEC 1815`;
		const country = 'United Kingdom';
		const locality = 'Middlesex';
		const district = 'Piccadilly';
		const place = `${district}, ${locality}, ${country}`;
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'BIRT': { DATE: date, PLAC: place } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('birthDate');
			expect(obj.birthDate).to.equal('1815-12-10');
			expect(obj).to.have.property('birthPlace');
			expect(obj.birthPlace).to.have.all.keys('@context', '@type', 'name', 'address');
			expect(obj.birthPlace.name).to.equal(place);
			expect(obj.birthPlace.address.streetAddress).to.equal(district);
			expect(obj.birthPlace.address.addressLocality).to.equal(locality);
			expect(obj.birthPlace.address.addressCountry).to.equal(country);
		}
	});

	it('Person record with death individual event should have expected properties', async () => {
		const name = 'Augusta Ada /Byron/';
		const date = `27 NOV 1852`;
		const country = 'United Kingdom';
		const locality = 'London';
		const district = 'Marylebone';
		const place = `${district}, ${locality}, ${country}`;
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'DEAT': { DATE: date, PLAC: place } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property('deathDate');
			expect(obj.deathDate).to.equal('1852-11-27');
			expect(obj).to.have.property('deathPlace');
			expect(obj.deathPlace).to.have.all.keys('@context', '@type', 'name', 'address');
			expect(obj.deathPlace.name).to.equal(place);
			expect(obj.deathPlace.address.streetAddress).to.equal(district);
			expect(obj.deathPlace.address.addressLocality).to.equal(locality);
			expect(obj.deathPlace.address.addressCountry).to.equal(country);
		}
	});

	it('Person record with other individual event should have expected properties', async () => {
		const name = 'Augusta Ada /Byron/';
		const date = `AFT 27 NOV 1852`;
		const place = `Church of St. Mary Magdalene, Hucknell, Ashfield, England`;
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'BURI': { DATE: date, PLAC: place } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property(`${bio.PREFIX}:event`);
			expect(obj[`${bio.PREFIX}:event`]).to.have.all.keys('@context', '@type', 'additionalType', 'startDate', 'location');
			expect(obj[`${bio.PREFIX}:event`].additionalType).to.equal(bio.TYPES.BURIAL);
			expect(obj[`${bio.PREFIX}:event`].startDate).to.equal('1852-11-27/..');
			expect(obj[`${bio.PREFIX}:event`].location.address.streetAddress).to.equal('Church of St. Mary Magdalene');
		}
	});

	it('Person record with group event should have expected properties', async () => {
		const name = 'Augusta Ada /Byron/';
		const date = `8 JUL 1835`;
		const src = { '@type': INDIVIDUAL, 'NAME': name, 'MARR': { DATE: date } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.property(`${bio.PREFIX}:event`);
			expect(obj[`${bio.PREFIX}:event`]).to.have.all.keys('@context', '@type', 'additionalType', 'startDate');
			expect(obj[`${bio.PREFIX}:event`].additionalType).to.equal(bio.TYPES.MARRIAGE);
			expect(obj[`${bio.PREFIX}:event`].startDate).to.equal('1835-07-08');
		}
	});
};
