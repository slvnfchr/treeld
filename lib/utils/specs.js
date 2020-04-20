
/**
 * Specs header file
 */

import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import spies from 'chai-spies'; // eslint-disable-line import/no-extraneous-dependencies

chai.use(spies);

export const { expect, spy } = chai;
global.expect = expect;
global.spy = spy;
