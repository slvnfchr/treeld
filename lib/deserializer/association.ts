import { Xref } from "../parser/types.ts";
import { ChunkWith, Optional, Several, Role } from "./types.ts";
import { Note } from "./note.ts";
import { SourceCitation } from "./source.ts";

/**
 * Association structure
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#ASSOCIATION_STRUCTURE
 */

export type Association = {
  ASSO: ChunkWith<
    {
      "@value": Xref;
      PHRASE?: string;
      ROLE: Role;
    } & Optional<Several<Note>> &
      Optional<Several<SourceCitation>>
  >;
};
