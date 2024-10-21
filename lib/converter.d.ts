import type { WithContext, Thing } from "schema-dts";

export type Chunk = WithContext<Thing>;

export default class Converter extends TransformStream {}
