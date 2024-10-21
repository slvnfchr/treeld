export type Chunk = {
  level: number;
  tag: string;
  value: string | object;
  xref: string;
};

export default class Parser extends TransformStream {}
