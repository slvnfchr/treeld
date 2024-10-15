import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { REPOSITORY } from '../gedcom.js';
import { isObject, schema, rdfs, dcmitype } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Short repository citation with no subrecords', async () => {
		const id = 'ID of repository';
		const source = { [REPOSITORY]: id };
		const data = createStreamFromObject(source);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('publisher');
			expect(obj.publisher).to.equal(id);
		}
	});

	it('Full repository citation with source call number and media type', async () => {
		const id = 'ID of repository';
		const reference = 'Reference in repository';
		const mediatype = 'Text';
		const source = { '@type': REPOSITORY, '@value': id, 'CALN': { '@value': reference, 'MEDI': mediatype } };
		const data = createStreamFromObject(source);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj)).to.be.true;
			expect(obj).to.have.all.keys('@context', 'identifier', 'format', 'publisher');
			expect(obj.identifier).to.equal(reference);
			expect(obj.format).to.equal(mediatype);
			expect(obj.publisher).to.equal(id);
		}
	});

	it('Repository citation with audio media type', async () => {
		const id = 'ID of repository';
		const reference = 'Reference in repository';
		const mediatype = 'Photograph';
		const source = { '@type': REPOSITORY, '@value': id, 'CALN': { '@value': reference, 'MEDI': mediatype } };
		const data = createStreamFromObject(source);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'identifier', 'publisher');
			expect(isObject(obj.type)).to.be.true;
			expect(obj.type).to.have.all.keys('@context', '@id', `${rdfs.PREFIX}:comment`);
			expect(obj.type.context.getDefault()).to.equal(dcmitype);
			expect(obj.type['@id']).to.equal(dcmitype.TYPES.IMAGE_STILL);
			expect(obj.type[`${rdfs.PREFIX}:comment`]).to.equal('photo');
			expect(obj.identifier).to.equal(reference);
			expect(obj.publisher).to.equal(id);
		}
	});

	it('Repository record', async () => {
		const id = 'ID of repository';
		const name = 'Name of repository';
		const date = '1 APR 1998';
		const time = '12:34:56';
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
		const src = {
			'@type': REPOSITORY,
			'RIN': id,
			'REFN': { '@value': identifier, 'TYPE': identifierType },
			'NAME': name,
			'CHAN': { DATE: { '@value': date, 'TIME': time } },
			'ADDR': { ADR1: address, POST: zipcode, CITY: locality, CTRY: country },
			'PHON': phone,
			'EMAIL': email,
			'FAX': fax,
			'WWW': web,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ORGANIZATION)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', '@id', 'identifier', 'name', 'address', 'email', 'telephone', 'faxNumber', 'url', 'modified');
			expect(obj['@id']).to.equal(id);
			expect(obj.identifier).to.have.all.keys('@value', `${rdfs.PREFIX}:comment`);
			expect(obj.identifier['@value']).to.equal(identifier);
			expect(obj.identifier[`${rdfs.PREFIX}:comment`]).to.equal(identifierType);
			expect(isObject(obj.address, schema.TYPES.ADDRESS)).to.be.true;
			expect(obj.address.streetAddress).to.equal(address);
			expect(obj.address.postalCode).to.equal(zipcode);
			expect(obj.address.addressLocality).to.equal(locality);
			expect(obj.address.addressCountry).to.equal(country);
			expect(obj.email).to.equal(email);
			expect(obj.telephone).to.equal(phone);
			expect(obj.faxNumber).to.equal(fax);
			expect(obj.url).to.equal(web);
			expect(obj.modified).to.equal('1998-04-01T12:34:56.000Z');
		}
	});
};
