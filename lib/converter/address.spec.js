import { it } from 'node:test';
import { createStreamFromObject } from '../utils/stream.js';
import { isObject, schema } from './context.js';
import { ADDRESS } from '../gedcom.js';
import Converter from '../converter.js';

export default () => {
	it('Address attribute should be converted to PostalAddress schema.org object', async () => {
		const country = 'United Kingdom';
		const region = 'England';
		const locality = 'London';
		const zipcode = 'W1U 4EE';
		const address1 = '1 Dorset Street';
		const address2 = 'Marylebone';
		const address3 = 'West End';
		const src = {
			'@type': ADDRESS,
			'ADR1': address1,
			'ADR2': address2,
			'ADR3': address3,
			'CITY': locality,
			'STAE': region,
			'POST': zipcode,
			'CTRY': country,
		};
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.ADDRESS)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'streetAddress', 'postalCode', 'addressLocality', 'addressRegion', 'addressCountry');
			expect(obj.streetAddress).to.have.members([address1, address2, address3]);
			expect(obj.postalCode).to.equal(zipcode);
			expect(obj.addressLocality).to.equal(locality);
			expect(obj.addressRegion).to.equal(region);
			expect(obj.addressCountry).to.equal(country);
		}
	});
};
