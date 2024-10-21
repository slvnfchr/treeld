import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { PLACE } from '../gedcom.js';
import { isObject, schema } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Place attribute should be converted to Place schema.org object', async () => {
		const country = 'United Kingdom';
		const locality = 'London';
		const src = { '@type': PLACE, '@value': `${locality}, ${country}` };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address');
			expect(obj.name).to.equal(src['@value']);
			expect(isObject(obj.address, schema.TYPES.ADDRESS)).to.be.true;
			expect(obj.address).to.have.all.keys('@context', '@type', 'addressLocality', 'addressCountry');
			expect(obj.address.addressLocality).to.equal(locality);
			expect(obj.address.addressCountry).to.equal(country);
		}
	});

	it('Place attribute with FORM subproperty and no value should not be converted to Place object and used as FORM for subsequent records', async () => {
		const country = 'United Kingdom';
		const locality = 'London';
		const address = 'Dorset street';
		const form = { '@type': PLACE, 'FORM': 'subdivision, city, country' };
		const src = { '@type': PLACE, '@value': `${address}, ${locality}, ${country}` };
		const data = createStreamFromObject([form, src]);
		const converter = new Converter();
		let index = 0;
		for await (const obj of data.pipeThrough(converter)) {
			if (index === 0) {
				expect(obj).to.be.null;
			} else {
				expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
				expect(obj.address).to.have.all.keys('@context', '@type', 'streetAddress', 'addressLocality', 'addressCountry');
				expect(obj.address.streetAddress).to.equal(address);
				expect(obj.address.addressLocality).to.equal(locality);
				expect(obj.address.addressCountry).to.equal(country);
			}
			index += 1;
		}
	});

	it('Place attribute with FORM subproperty should be converted to Place object according to that pattern', async () => {
		const country = 'United Kingdom';
		const region = 'England';
		const locality = 'London';
		const address = 'Dorset street';
		const withoutForm = { '@type': PLACE, '@value': `${address}, ${locality}, ${region}, ${country}` };
		const withForm = { '@type': PLACE, '@value': `${address}, ${locality}, ${region}, ${country}`, 'FORM': 'subdivision, city, region, country' };
		const data = createStreamFromObject([withoutForm, withForm]);
		const converter = new Converter();
		let index = 0;
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj.address.streetAddress).to.equal(address);
			expect(obj.address.addressLocality).to.equal(locality);
			if (index === 0) {
				// Parsing is based on previous test pattern
				expect(obj.address).to.not.have.key('addressRegion');
				expect(obj.address.addressCountry).to.equal(region);
			} else {
				expect(obj.address).to.have.any.key('addressRegion');
				expect(obj.address.addressRegion).to.equal(region);
				expect(obj.address.addressCountry).to.equal(country);
			}
			index += 1;
		}
	});

	it('Place attribute with MAP subproperty should be converted to Place objet with latitude/longitude properties', async () => {
		const country = 'United Kingdom';
		const locality = 'London';
		const latitude = 51.5194691;
		const longitude = -0.1584877;
		const src = { '@type': 'PLAC', '@value': `${locality}, ${country}`, 'MAP': { LATI: `N${latitude}`, LONG: `W${Math.abs(longitude)}` } };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address', 'latitude', 'longitude');
			expect(obj.latitude).to.equal(`${latitude}`);
			expect(obj.longitude).to.equal(`${longitude}`);
		}
	});
};
