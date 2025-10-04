import { Branded } from "../utils/types.ts";

type ExtendedTag = Branded<`_${string}`, "ExtendedTag">;
type StandardTag = Branded<string, "StandardTag">;
export type Tag = StandardTag | ExtendedTag;

export type Xref = `@${Tag}@`;

export type Chunk = {
  level: number;
  tag: Tag;
  value: string;
  xref: Xref;
};
