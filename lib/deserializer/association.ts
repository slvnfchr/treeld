import { Xref } from "../parser/types.ts";
import { Chunk, Note, Multiple, ScalarOrObject } from "./types.ts";
import { SourceCitation } from "./source.ts";

export type Association = Chunk<{
  "@value": Xref;
  PHRASE?: string;
  ROLE: ScalarOrObject<string, { PHRASE: string }>;
  NOTE?: Multiple<Note>;
  SNOTE?: Multiple<Xref>;
  SOUR?: Multiple<SourceCitation>;
}>;
