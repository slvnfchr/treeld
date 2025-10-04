import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, Optional, Several, ScalarOrObject, Medium } from "./types.ts";
import { Note } from "./note.ts";
import { SourceCitation } from "./source.ts";
import { ChangeDate, CreationDate } from "./date.ts";

/**
 * File
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#FILE
 */

export type File = ChunkWith<{
  FORM: ScalarOrObject<string, { MEDI: Medium }>;
  TITL?: string;
  TRAN?: Multiple<ScalarOrObject<string, { FORM: string }>>;
}>;

/**
 * Multimedia record
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#MULTIMEDIA
 */

export type MultimediaRecord = ChunkWith<
  {
    "@ref": Xref;
    RESN?: string;
    FILE: Multiple<File>;
  } & Optional<Several<SourceCitation>> &
    Optional<Several<Note>> &
    Optional<ChangeDate> &
    Optional<CreationDate>
>;

/**
 * Multimedia Link
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#MULTIMEDIA_LINK
 */

export type MultimediaLink = {
  OBJE: ScalarOrObject<
    Xref,
    {
      CROP?: ChunkWith<{
        TOP: number;
        LEFT: number;
        HEIGHT: number;
        WIDTH: number;
      }>;
      TITL?: string;
    }
  >;
};
