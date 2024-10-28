import { it } from 'node:test';
import { expect } from 'chai';

import { parse } from './index.js';

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
};
