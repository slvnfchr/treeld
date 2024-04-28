import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { isObject, schema } from './context.js';
import { parse } from './place/location.js';
import Converter from '../converter.js';

export default () => {
	it('Country only with default pattern', () => {
		const place = 'United Kingdom';
		const obj = parse(place);
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country');
		expect(obj.country).to.equal(place);
	});

	it('Locality and country with default pattern', () => {
		const country = 'United Kingdom';
		const locality = 'London';
		const place = `${locality}, ${country}`;
		const obj = parse(place);
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country', 'locality');
		expect(obj.country).to.equal(country);
		expect(obj.locality).to.equal(locality);
	});

	it('Locality, region and country with default pattern', () => {
		const country = 'United Kingdom';
		const region = 'England';
		const locality = 'London';
		const place = `${locality}, ${region}, ${country}`;
		const obj = parse(place);
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country', 'region', 'locality');
		expect(obj.country).to.equal(country);
		expect(obj.region).to.equal(region);
		expect(obj.locality).to.equal(locality);
	});

	it('Locality, zipcode and country with default pattern', () => {
		const country = 'United Kingdom';
		const zipcode = 'W1U 6QR';
		const locality = 'London';
		const place = `${locality}, ${zipcode}, ${country}`;
		const obj = parse(place);
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country', 'zipcode', 'locality');
		expect(obj.country).to.equal(country);
		expect(obj.zipcode).to.equal(zipcode);
		expect(obj.locality).to.equal(locality);
	});

	it('Locality, district, region and country with default pattern', () => {
		const country = 'United Kingdom';
		const region = 'England';
		const district = 'Marylebone';
		const locality = 'London';
		const place = `${locality}, ${district}, ${region}, ${country}`;
		const obj = parse(place);
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country', 'region', 'district', 'locality');
		expect(obj.country).to.equal(country);
		expect(obj.region).to.equal(region);
		expect(obj.district).to.equal(district);
		expect(obj.locality).to.equal(locality);
	});

	it('Locality, zipcode, region and country with default pattern', () => {
		const country = 'United Kingdom';
		const region = 'England';
		const zipcode = 'W1U 6QR';
		const locality = 'London';
		const place = `${locality}, ${zipcode}, ${region}, ${country}`;
		const obj = parse(place);
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country', 'region', 'zipcode', 'locality');
		expect(obj.country).to.equal(country);
		expect(obj.region).to.equal(region);
		expect(obj.zipcode).to.equal(zipcode);
		expect(obj.locality).to.equal(locality);
	});

	it('Locality, zipcode, country and address with pattern', () => {
		const country = 'United Kingdom';
		const address = 'Dorset street';
		const zipcode = 'W1U 6QR';
		const locality = 'London';
		const place = `${address}, ${locality}, ${zipcode}, ${country}`;
		const obj = parse(place, 'subdivision, place, area code, country');
		expect(obj).to.be.an('object');
		expect(obj).to.have.all.keys('country', 'address', 'zipcode', 'locality');
		expect(obj.country).to.equal(country);
		expect(obj.address).to.equal(address);
		expect(obj.zipcode).to.equal(zipcode);
		expect(obj.locality).to.equal(locality);
	});

	it('Place attribute should be converted to Place schema.org object', async () => {
		const country = 'United Kingdom';
		const locality = 'London';
		const PLAC = `${locality}, ${country}`;
		const src = { PLAC };
		const data = createStreamFromObject({ data: src });
		const converter = new Converter();
		for await (const {
			data: { PLAC: obj },
		} of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address');
			expect(obj.name).to.equal(PLAC);
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
		const src = { PLAC: `${address}, ${locality}, ${country}` };
		const header = { PLAC: { FORM: 'subdivision, city, country' } };
		const data = createStreamFromObject([{ data: header }, { data: src }]);
		const converter = new Converter();
		let index = 0;
		for await (const {
			data: { PLAC: obj },
		} of data.pipeThrough(converter)) {
			if (index === 0) {
				expect(isObject(obj, schema.TYPES.PLACE)).to.be.false;
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
		const src = { PLAC: { '@value': `${address}, ${locality}, ${region}, ${country}` } };
		const srcForm = { PLAC: { '@value': `${address}, ${locality}, ${region}, ${country}`, 'FORM': 'subdivision, city, region, country' } };
		const data = createStreamFromObject([{ data: src }, { data: srcForm }]);
		const converter = new Converter();
		let index = 0;
		for await (const {
			data: { PLAC: obj },
		} of data.pipeThrough(converter)) {
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
		const src = { PLAC: { '@value': `${locality}, ${country}`, 'MAP': { LATI: `N${latitude}`, LONG: `W${Math.abs(longitude)}` } } };
		const data = createStreamFromObject({ data: src });
		const converter = new Converter();
		for await (const {
			data: { PLAC: obj },
		} of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.PLACE)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'name', 'address', 'latitude', 'longitude');
			expect(obj.latitude).to.equal(`${latitude}`);
			expect(obj.longitude).to.equal(`${longitude}`);
		}
	});
};
