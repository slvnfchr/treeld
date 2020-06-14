
import { createStreamFromObject } from '../utils/stream';
import { isObject, schema } from './context';
import Converter from '../converter';

export default () => {

	it('Address attribute should be converted to PostalAddress schema.org object', (done) => {
		const country = 'United Kingdom';
		const region = 'England';
		const locality = 'London';
		const zipcode = 'W1U 4EE';
		const address1 = '1 Dorset Street';
		const address2 = 'Marylebone';
		const address3 = 'West End';
		const ADDR = {
			ADR1: address1,
			ADR2: address2,
			ADR3: address3,
			CITY: locality,
			STAE: region,
			POST: zipcode,
			CTRY: country,
		};
		const data = createStreamFromObject({ data: { ADDR } });
		const converter = new Converter();
		const onData = spy(({ data: { ADDR: obj } }) => {
			expect(isObject(obj, schema.TYPES.ADDRESS)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'streetAddress', 'postalCode', 'addressLocality', 'addressRegion', 'addressCountry');
			expect(obj.streetAddress).to.have.members([address1, address2, address3]);
			expect(obj.postalCode).to.equal(zipcode);
			expect(obj.addressLocality).to.equal(locality);
			expect(obj.addressRegion).to.equal(region);
			expect(obj.addressCountry).to.equal(country);
		});
		converter.on('data', onData);
		converter.on('end', done);
		data.pipe(converter);
	});


};
