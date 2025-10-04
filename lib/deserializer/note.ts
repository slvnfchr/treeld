import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, Optional, Several, ScalarOrObject, WithTranslation, Identifier } from "./types.ts";
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
    "@ref": Xref;
    "@value": string;
    MIME?: MediaType;
    LANG?: Language;
    TRAN?: Multiple<ScalarOrObject<string, { LANG: Language; MIME: MediaType }>>;
  } & Optional<Several<SourceCitation>> &
    Optional<Several<Identifier>> &
    Optional<ChangeDate> &
    Optional<CreationDate>
>;

export type Note =
  | {
      NOTE: IndividualNote;
    }
  | {
      SNOTE: Multiple<Xref>;
    };
