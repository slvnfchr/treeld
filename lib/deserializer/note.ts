import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, ScalarOrObject, WithTranslation } from "./types.ts";
import { Language, MediaType } from "../gedcom/types.ts";
import { ChangeDate, CreationDate } from "./date.ts";
import { SourceCitation } from "./source.ts";

/**
 * Note structure
 */

type IndividualNote = ScalarOrObject<string, WithTranslation<{ MIME: string }>>;

/**
 * Shared Note record
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#SHARED_NOTE_RECORD
 */

export type ShareNote = ChunkWith<
  {
    "@value": string;
    MIME?: MediaType;
    LANG?: Language;
    TRAN?: Multiple<ScalarOrObject<string, { LANG: Language; MIME: MediaType }>>;
    REFN?: ScalarOrObject<string, { TYPE: string }>;
    UID: string;
    EXID?: ScalarOrObject<string, { TYPE: Language }>;
  } & SourceCitation &
    ChangeDate &
    CreationDate
>;

export type SingleNote = {
  NOTE?: IndividualNote;
  SNOTE?: Xref;
};

export type Note = {
  NOTE?: Multiple<IndividualNote>;
  SNOTE?: Multiple<Xref>;
};
