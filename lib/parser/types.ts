type ExtendedTag = `_${string}`;
type StandardTag = `${string}`;
type Tag = StandardTag | ExtendedTag;

export type Xref = `@${Tag}@`;

export type Chunk = {
  level: number;
  tag: Tag;
  value: string;
  xref: Xref;
};
