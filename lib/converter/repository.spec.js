import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { isObject, schema, rdfs, dcmitype } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Short repository citation with no subrecords', async () => {
		const id = 'ID of repository';
		const source = { REPO: { '@id': id } };
		const data = createStreamFromObject([{ data: source }]);
		const converter = new Converter();
		for await (const { data: obj } of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('publisher');
			expect(obj.publisher).to.equal(id);
		}
	});

	it('Full repository citation with source call number and media type', async () => {
		const id = 'ID of repository';
		const reference = 'Reference in repository';
		const mediatype = 'Text';
		const source = { REPO: { '@id': id, 'CALN': { '@value': reference, 'MEDI': mediatype } } };
		const data = createStreamFromObject([{ data: source }]);
		const converter = new Converter();
		for await (const { data: obj } of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('source');
			expect(isObject(obj.source)).to.be.true;
			expect(obj.source).to.have.all.keys('@context', 'identifier', 'format', 'publisher');
			expect(obj.source.identifier).to.equal(reference);
			expect(obj.source.format).to.equal(mediatype);
			expect(obj.source.publisher).to.equal(id);
		}
	});

	it('Repository citation with audio media type', async () => {
		const id = 'ID of repository';
		const reference = 'Reference in repository';
		const mediatype = 'Photograph';
		const source = { REPO: { '@id': id, 'CALN': { '@value': reference, 'MEDI': mediatype } } };
		const data = createStreamFromObject([{ data: source }]);
		const converter = new Converter();
		for await (const { data: obj } of data.pipeThrough(converter)) {
			expect(obj).to.have.all.keys('source');
			expect(isObject(obj.source)).to.be.true;
			expect(obj.source).to.have.all.keys('@context', '@type', 'identifier', 'publisher');
			expect(isObject(obj.source.type)).to.be.true;
			expect(obj.source.type).to.have.all.keys('@context', '@id', `${rdfs.PREFIX}:comment`);
			expect(obj.source.type.context.getDefault()).to.equal(dcmitype);
			expect(obj.source.type['@id']).to.equal(dcmitype.TYPES.IMAGE_STILL);
			expect(obj.source.type[`${rdfs.PREFIX}:comment`]).to.equal('photo');
			expect(obj.source.identifier).to.equal(reference);
			expect(obj.source.publisher).to.equal(id);
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
		const repository = {
			RIN: id,
			REFN: { '@value': identifier, 'TYPE': identifierType },
			NAME: name,
			CHAN: { DATE: { '@value': date, 'TIME': time } },
			ADDR: { ADR1: address, POST: zipcode, CITY: locality, CTRY: country },
			PHON: phone,
			EMAIL: email,
			FAX: fax,
			WWW: web,
		};
		const data = createStreamFromObject([
			{ property: 'DATE', data: repository.CHAN },
			{ property: 'ADDR', data: repository.ADDR },
			{ type: 'REPO', data: repository },
		]);
		const converter = new Converter();
		let chunk = 0;
		for await (const { data: obj } of data.pipeThrough(converter)) {
			if (chunk === 2) {
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
				expect(obj.modified).to.equal('1998-04-01T12:34:00.000Z');
			}
			chunk += 1;
		}
	});
};
