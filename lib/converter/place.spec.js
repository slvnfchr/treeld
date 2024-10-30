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

	it('Place attribute with phonetisation and romanisation subproperties should be converted to Place objet with name variations properties', async () => {
		const country = '中国';
		const locality = '北京';
		const name = `${locality}, ${country}`;
		const romanisation = { 'TYPE': 'pinyin', '@value': 'Běijīng, Zhōngguó' };
		const phonetisation = { 'TYPE': 'ipa', '@value': 'pe˨˩˦i.tɕi˥ŋ, tʂʊŋ˥kwɔ˧˥' };
		const src = { '@type': 'PLAC', '@value': name, 'ROMN': romanisation, 'FONE': phonetisation };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address');
			expect(obj['@context']).to.have.all.keys('@vocab', 'name');
			expect(obj['@context'].name).to.have.all.keys('@language');
			expect(obj['@context'].name['@language']).to.equal('@container');
			expect(obj.name).to.have.all.keys('@none', 'zh-Latn-pinyin', 'und');
			expect(obj.name['@none']).to.equal(name);
			expect(obj.name['zh-Latn-pinyin']).to.equal(romanisation['@value']);
			expect(obj.name.und).to.equal(phonetisation['@value']);
		}
	});

	it('Place attribute with MAP subproperty should be converted to Place objet with latitude/longitude properties', async () => {
		let country = 'United Kingdom';
		let locality = 'London';
		let latitude = 51.5194691;
		let longitude = -0.1584877;
		let src = { '@type': 'PLAC', '@value': `${locality}, ${country}`, 'MAP': { LATI: `N${latitude}`, LONG: `W${Math.abs(longitude)}` } };
		let data = createStreamFromObject(src);
		let converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address', 'latitude', 'longitude');
			expect(obj.latitude).to.equal(`${latitude}`);
			expect(obj.longitude).to.equal(`${longitude}`);
		}
		country = 'Australia';
		locality = 'Perth';
		latitude = -31.9558933;
		longitude = 115.8605855;
		src = { '@type': 'PLAC', '@value': `${locality}, ${country}`, 'MAP': { LATI: `S${Math.abs(latitude)}`, LONG: `E${longitude}` } };
		data = createStreamFromObject(src);
		converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address', 'latitude', 'longitude');
			expect(obj.latitude).to.equal(`${latitude}`);
			expect(obj.longitude).to.equal(`${longitude}`);
		}
	});
};
