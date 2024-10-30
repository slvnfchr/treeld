type ExtendedTag = `_${string}`;
type StandardTag = `${string}`;
type Tag = StandardTag | ExtendedTag;
type Xref = `@${Tag}@`;

export type Chunk = {
  level: number;
  tag: Tag;
  value: string;
  xref: Xref;
};

export default class Parser extends TransformStream {}
