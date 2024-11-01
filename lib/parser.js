import { TransformStream } from 'node:stream/web';

import { LEVEL, TAG, VALUE, XREF } from './gedcom.js';

const LINE_TERMINATOR = /\r\n|\n|\r/i; // [ carriage_return | line_feed | carriage_return + line_feed ]
const LINE = /^([0-9]{1,2})(\s(@[^@]{1,20}@))?\s_?([^_\s]+)(\s(.*))?$/i; // level + [ delim + xref_ID ] + delim + tag + [ delim + line_value ] + terminator

/**
 * GEDCOM parser stream that emits given file lines structure one by one
 * @see {@link https://www.gedcom.org/} for further information
 * @const Parser
 * @type {TransformStream}
 * @instance
 */

export default class Parser extends TransformStream {
	constructor() {
		let tail = '';
		super({
			/**
			 * @param {string} chunk
			 * @param {TransformStreamDefaultController} controller
			 */
			transform(chunk, controller) {
				const lines = `${tail}${chunk.toString()}`.split(LINE_TERMINATOR);
				[tail] = lines.splice(lines.length - 1, 1);
				lines.forEach((line) => {
					const data = line.match(LINE);
					if (data) {
						/**
						 * @type {import('./parser/types.ts').Chunk}
						 */
						const obj = {
							[LEVEL]: parseInt(data[1], 10),
							[TAG]: data[4],
							[XREF]: data[3],
							[VALUE]: data[6],
						};
						controller.enqueue(obj);
					}
				});
			},
		});
	}
}
