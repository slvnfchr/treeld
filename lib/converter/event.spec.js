import { it } from 'node:test';
import { expect } from 'chai';

import { createStreamFromObject } from '../utils/stream.js';
import { ASSOCIATION, EVENT, MULTIMEDIA, INDIVIDUAL, ROLE_TYPES, SOURCE, QUALITY } from '../gedcom/constants.js';
import { isObject, bio, schema, rdfs } from './context.js';
import Converter from '../converter.js';

export default () => {
	it('Event object with known type should be converted to a JSON-LD objet with corresponding type', async () => {
		const date = '26 DEC 1791';
		const country = 'United Kingdom';
		const locality = 'London';
		const place = `${locality}, ${country}`;
		const src = { '@type': 'BIRT', 'DATE': date, 'PLAC': place };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.EVENT)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'additionalType', 'startDate', 'location');
			expect(obj.startDate).to.equal('1791-12-26');
			expect(obj.additionalType).to.equal(bio.TYPES.BIRTH);
			expect(isObject(obj.location, schema.TYPES.PLACE)).to.be.true;
			expect(obj.location.name).to.equal(place);
		}
	});

	it('Event object with group type should be converted to a JSON-LD objet with corresponding type', async () => {
		const date = '25 JUL 1814';
		const country = 'United Kingdom';
		const locality = 'Teignmouth';
		const place = `${locality}, ${country}`;
		const src = { '@type': 'MARR', 'DATE': date, 'PLAC': place };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj, schema.TYPES.EVENT)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'additionalType', 'startDate', 'location');
			expect(obj.startDate).to.equal('1814-07-25');
			expect(obj.additionalType).to.equal(bio.TYPES.MARRIAGE);
			expect(isObject(obj.location, schema.TYPES.PLACE)).to.be.true;
			expect(obj.location.name).to.equal(place);
		}
	});

	it('Event object with unknown type should be converted to a JSON-LD objet with additional type annotation', async () => {
		const date = '1841';
		const place = 'London, United Kingdom';
		const src = { '@type': 'CENS', 'DATE': date, 'PLAC': place };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		let count = 0;
		for await (const obj of data.pipeThrough(converter)) {
			if (count === 1) {
				expect(isObject(obj, schema.TYPES.EVENT)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@type', 'additionalType', 'startDate', 'location');
				expect(obj.additionalType).to.match(/^#/i);
			} else {
				// Additional stream chunk for event type
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@id', '@type', 'rdfs:label', 'rdfs:comment');
				expect(obj['@id']).to.equal('Census');
			}
			count += 1;
		}
		expect(count).to.equal(2);
	});

	it('Event object with unknown group type should be converted to a JSON-LD objet with corresponding type', async () => {
		const date = '25 JUL 1814';
		const country = 'United Kingdom';
		const locality = 'Teignmouth';
		const place = `${locality}, ${country}`;
		const src = { '@type': 'MARC', 'DATE': date, 'PLAC': place };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		let count = 0;
		for await (const obj of data.pipeThrough(converter)) {
			if (count === 1) {
				expect(isObject(obj, schema.TYPES.EVENT)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@type', 'additionalType', 'startDate', 'location');
				expect(obj.additionalType).to.match(/^#/i);
			} else {
				// Additional stream chunk for event type
				expect(isObject(obj)).to.be.true;
				expect(obj).to.have.all.keys('@context', '@id', '@type', 'rdfs:label', 'rdfs:comment');
				expect(obj['@id']).to.equal('MarriageContract');
			}
			count += 1;
		}
		expect(count).to.equal(2);
	});

	it('Custom event attribute should be converted to a JSON-LD objet with additional comment property', async () => {
		const date = '1816';
		const type = 'Election as a Fellow of the Royal Society';
		const comment = 'this is a comment';
		const src = { '@type': EVENT, 'TYPE': type, 'DATE': date, 'NOTE': comment };
		const data = createStreamFromObject(src);
		const converter = new Converter();
		for await (const obj of data.pipeThrough(converter)) {
			expect(isObject(obj)).to.be.true;
			expect(obj).to.have.all.keys('@context', '@type', 'additionalType', 'name', 'startDate', `${rdfs.PREFIX}:comment`);
			expect(obj.startDate).to.equal(date);
			expect(obj.name).to.equal(type);
			expect(obj[`${rdfs.PREFIX}:comment`]).to.equal(comment);
		}
	});

	it('Event object with simple association structure should be converted to Event object with participant property', async () => {
		const id = '@ID@';
		const role = 'WITN';
		const data = createStreamFromObject([
			{ '@ref': id, '@type': INDIVIDUAL },
			{ '@type': EVENT, [ASSOCIATION]: { '@value': id, 'ROLE': role } },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [individual, event] = await converter.chunks();
		expect(event).to.have.property('participant');
		expect(isObject(event.participant, schema.TYPES.ROLE)).to.be.true;
		expect(event.participant).to.have.all.keys('@context', '@type', 'participant', 'roleName');
		expect(event.participant.roleName).to.equal(ROLE_TYPES[role]);
		expect(event.participant.participant).to.equal(id);
	});

	it('Event object with complex association structure should be converted to Event object with participant property', async () => {
		const id = '@ID@';
		const roleType = 'OTHER';
		const role = 'Friend';
		const description = 'Witness';
		const data = createStreamFromObject([
			{ '@ref': id, '@type': INDIVIDUAL },
			{ '@type': EVENT, [ASSOCIATION]: { '@value': id, 'PHRASE': description, 'ROLE': { '@value': roleType, 'PHRASE': role } } },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [individual, event] = await converter.chunks();
		expect(event).to.have.property('participant');
		expect(isObject(event.participant, schema.TYPES.ROLE)).to.be.true;
		expect(event.participant).to.have.all.keys('@context', '@type', 'participant', 'roleName', 'rdfs:comment');
		expect(event.participant.roleName).to.deep.equal([ROLE_TYPES[roleType], role]);
		expect(event.participant.participant).to.equal(id);
		expect(event.participant['rdfs:comment']).to.equal(description);
	});

	it('Event object with simple source citation should be converted to Event object with subjectOf property', async () => {
		const id = '@ID@';
		const data = createStreamFromObject([
			{ '@ref': id, '@type': SOURCE },
			{ '@type': EVENT, [SOURCE]: id },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [source, event] = await converter.chunks();
		expect(event).to.have.property('subjectOf');
		expect(isObject(event.subjectOf, schema.TYPES.ARCHIVE)).to.be.true;
		expect(event.subjectOf).to.equal(source);
	});

	it('Event object with complex source citation should be converted to Event object with subjectOf property', async () => {
		const id = '@ID@';
		const page = '1';
		const quality = 1;
		const data = createStreamFromObject([
			{ '@ref': id, '@type': SOURCE },
			{ '@type': EVENT, [SOURCE]: { '@value': id, 'PAGE': page, 'QUAY': quality } },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [source, event] = await converter.chunks();
		expect(event).to.have.property('subjectOf');
		expect(isObject(event.subjectOf, schema.TYPES.ARCHIVE)).to.be.true;
		expect(event.subjectOf.description).to.equal(page);
		expect(event.subjectOf['rdfs:comment']).to.equal(QUALITY[quality]);
		expect(event.subjectOf.isPartOf).to.equal(source);
	});

	it('Event object with multimedia link should be converted to Event object with subjectOf property', async () => {
		const id = '@ID@';
		const file = 'document.pdf';
		const title = 'Title of document';
		const data = createStreamFromObject([
			{ '@ref': id, '@type': MULTIMEDIA, 'FILE': file },
			{ '@type': EVENT, [MULTIMEDIA]: { '@value': id, 'TITL': title } },
		]);
		const converter = new Converter();
		data.pipeThrough(converter);
		const [multimedia, event] = await converter.chunks();
		expect(event).to.have.property('subjectOf');
		expect(isObject(event.subjectOf, schema.TYPES.DIGITAL_DOCUMENT)).to.be.true;
		expect(event.subjectOf).to.have.all.keys('@context', '@type', 'name', 'sameAs');
		expect(event.subjectOf.name).to.equal(title);
		expect(event.subjectOf.sameAs).to.equal(multimedia);
	});
};
