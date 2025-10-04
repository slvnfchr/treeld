import { TransformStream } from 'node:stream/web';

// Object chunks (file line) properties
const LEVEL = 'level';
const XREF = 'xref';
const TAG = 'tag';
const VALUE = 'value';
export { LEVEL, XREF, TAG, VALUE };

const LINE_TERMINATOR = /\r\n|\n|\r/i; // [ carriage_return | line_feed | carriage_return + line_feed ]
const LINE = /^([0-9]{1,2})(\s(@[^@]{1,20}@))?\s(_?[^_\s]+)(\s(.*))?$/i; // level + [ delim + xref_ID ] + delim + tag + [ delim + line_value ] + terminator

/**
 * GEDCOM parser stream that emits given file lines structure one by one
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
							[TAG]: /** @type {import('./parser/types.ts').Tag} **/ (data[4]),
							[XREF]: /** @type {import('./parser/types.ts').Xref} **/ (data[3]),
							[VALUE]: data[6],
						};
						controller.enqueue(obj);
					}
				});
			},
		});
	}
}
