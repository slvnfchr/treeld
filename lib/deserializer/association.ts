import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, ScalarOrObject } from "./types.ts";
import { Note } from "./note.ts";
import { SourceCitation } from "./source.ts";

export type Association = ChunkWith<
  {
    "@value": Xref;
    PHRASE?: string;
    ROLE: ScalarOrObject<string, { PHRASE: string }>;
  } & SourceCitation &
    Note
>;
