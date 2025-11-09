import { it } from 'node:test';
import chai, { expect } from 'chai';
import spies from 'chai-spies';

chai.use(spies);

import { createChunk, Registry } from './registry.js';

export default () => {
	it('Registry enables to set and retrieve elements according to their identifier', async () => {
		const registry = new Registry();
		const id = 'id';
		const value = { property: 'value' };
		registry.set(id, value);
		expect(registry.get(id)).to.equal(value);
	});

	it('Registry enables to set references to elements before creating them', async () => {
		const registry = new Registry();
		const id = 'id';
		const value = { property: 'value' };
		const callback = chai.spy();
		registry.addReference(id, callback);
		expect(registry.get(id)).to.be.null;
		registry.set(id, value);
		registry.resolveReferences();
		expect(callback).to.have.been.called.with(value);
	});

	it('Registry enables to set references to elements and log them', async () => {
		const registry = new Registry();
		const id1 = 'id1';
		const value1 = { property: 'value1' };
		const id2 = 'id2';
		const value2 = { property: 'value2' };
		registry.set(id1, value1);
		registry.set(id2, value2);
		const callback1 = chai.spy();
		registry.addReference(id1, callback1);
		const thrower = () => {
			throw new Error();
		};
		const callback2 = chai.spy(thrower);
		registry.addReference(id2, callback2);
		const logger = { error: chai.spy((e) => console.log(e)) };
		registry.resolveReferences(logger);
		expect(callback1).to.have.been.called.with(value1);
		expect(callback2).to.have.been.called.with(value2);
		expect(logger.error).to.have.been.called.with(`Cannot resolve reference ${id2}`);
	});

	it('Created chunk should have the expected properties', async () => {
		const registry = new Registry();
		const parent = createChunk(registry, {});
		const data = {
			'@ref': '@ID@',
			'@parent': parent,
			'@type': 'type',
			'property': 'test',
		};
		const child = createChunk(registry, data);
		expect(child).to.have.property('@registry').to.equal(registry);
		expect(child).to.have.property('@ref').to.equal(data['@ref']);
		expect(child).to.have.property('@parent').to.equal(parent);
		expect(child).to.have.property('@index').to.equal(0);
		expect(child).to.have.property('@type').to.equal(data['@type']);
		expect(child).to.have.all.keys('property');
	});

	it('Chunks references should be resolved when registry is complete', async () => {
		const registry = new Registry();
		const parentData = { '@ref': '@PARENT@' };
		const parent = createChunk(registry, parentData);
		const childData = { '@ref': '@ID@', 'reference': parentData['@ref'] };
		const child = createChunk(registry, childData);
		expect(registry.get(childData['@ref'])).to.equal(child);
		expect(registry.get(parentData['@ref'])).to.equal(parent);
		expect(child.reference).to.equal(parentData['@ref']);
		registry.complete = true;
		expect(child.reference).to.equal(parent);
	});
};
