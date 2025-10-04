import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, ScalarOrObject } from "./types.ts";
import { Note } from "./note.ts";
import { SourceCitation } from "./source.ts";
import { ChangeDate, CreationDate } from "./date.ts";

/**
 * File
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#FILE
 */

export type File = ChunkWith<{
  FORM: ScalarOrObject<string, { MEDI: ScalarOrObject<string, { PHRASE: string }> }>;
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
  } & SourceCitation &
    Note &
    ChangeDate &
    CreationDate
>;

/**
 * Multimedia Link
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#MULTIMEDIA_LINK
 */

export type MultimediaLink = ScalarOrObject<
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
