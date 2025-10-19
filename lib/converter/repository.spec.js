import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { REPOSITORY } from '../gedcom/constants.js';
import { isObject, schema, rdfs } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Full repository citation with source call number', async () => {
		const id = 'ID of repository';
		const reference = 'Reference in repository';
		const source = { '@type': REPOSITORY, '@value': id, 'CALN': { '@value': reference } };
		const data = createStreamFromObject(source);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ARCHIVE_ORGANIZATION)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@id', '@type', 'identifier');
			expect(obj['@id']).to.equal(id);
			expect(obj.identifier).to.equal(reference);
		}
	});

	it('Repository record', async () => {
		const id = 'ID of repository';
		const name = 'Name of repository';
		const country = 'Country';
		const locality = 'City';
		const zipcode = 'Zipcode';
		const address = 'Repository address';
		const phone = 'Phone number';
		const fax = 'Fax number';
		const email = 'Email address';
		const web = 'Web address';
		const identifier = 'Source reference';
		const identifierType = 'Source reference type';
		const creationDate = '01 APR 1998';
		const modificationDate = '13 MAY 2020';
		const modificationTime = '12:30:00';
		const src = {
			'@type': REPOSITORY,
			'RIN': id,
			'REFN': { '@value': identifier, 'TYPE': identifierType },
			'NAME': name,
			'ADDR': { ADR1: address, POST: zipcode, CITY: locality, CTRY: country },
			'PHON': phone,
			'EMAIL': email,
			'FAX': fax,
			'WWW': web,
			'CREA': { DATE: creationDate },
			'CHAN': { DATE: { '@value': modificationDate, 'TIME': modificationTime } },
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ARCHIVE_ORGANIZATION)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', '@id', 'identifier', 'name', 'address', 'email', 'telephone', 'faxNumber', 'url', 'dateCreated', 'dateModified', 'rdfs:comment');
			expect(obj['@id']).to.equal(identifier);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(identifierType);
			expect(isObject(obj.address, schema.TYPES.ADDRESS)).to.be.true;
			expect(obj.address.streetAddress).to.equal(address);
			expect(obj.address.postalCode).to.equal(zipcode);
			expect(obj.address.addressLocality).to.equal(locality);
			expect(obj.address.addressCountry).to.equal(country);
			expect(obj.email).to.equal(email);
			expect(obj.telephone).to.equal(phone);
			expect(obj.faxNumber).to.equal(fax);
			expect(obj.url).to.equal(web);
			expect(obj.dateCreated).to.equal('1998-04-01');
			expect(obj.dateModified).to.equal('2020-05-13T12:30:00.000Z');
		}
	});
};
