import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, Optional, Several, ScalarOrObject, Identifier, Role, Medium } from "./types.ts";
import { Language, MediaType } from "../gedcom/types.ts";
import { Note } from "./note.ts";
import { Date, ChangeDate, CreationDate } from "./date.ts";
import { Place, Address } from "./location.ts";
import { MultimediaLink } from "./multimedia.ts";

/**
 * Source citation
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#SOURCE_CITATION
 */

type CertaintyAssessment = "0" | "1" | "2" | "3";

export type SourceCitation = {
  SOUR?: Multiple<
    ScalarOrObject<
      Xref,
      {
        PAGE?: string;
        DATA?: ChunkWith<{
          DATE?: Date;
          TEXT?: Multiple<ScalarOrObject<string, { MIME?: MediaType; LANG?: Language }>>;
        }>;
        EVEN?: ScalarOrObject<string, { PHRASE?: string; ROLE?: Role }>;
        QUAY?: CertaintyAssessment;
      } & Optional<Several<MultimediaLink>> &
        Optional<Several<Note>>
    >
  >;
};

/**
 * Source record
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#SOURCE_RECORD
 */

export type Source = {
  "@ref": Xref;
  DATA?: ChunkWith<
    {
      EVEN?: Multiple<
        ScalarOrObject<
          string,
          {
            DATE?: ScalarOrObject<Date, { PHRASE: string }>;
            PLAC?: Place;
          }
        >
      >;
      AGNC?: string;
    } & Optional<Several<Note>>
  >;
  AUTH?: string;
  TITL?: string;
  ABBR?: string;
  PUBL?: string;
  TEXT?: ScalarOrObject<string, { MIME: MediaType; LANG: Language }>;
} & Optional<Several<RepositoryCitation>> &
  Optional<Several<Identifier>> &
  Optional<Several<Note>> &
  Optional<Several<MultimediaLink>> &
  Optional<ChangeDate> &
  Optional<CreationDate>;

/**
 * Repository citation
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#SOURCE_REPOSITORY_CITATION
 */

export type RepositoryCitation = {
  REPO: ScalarOrObject<
    Xref,
    Optional<Several<Note>> & {
      CALN?: Multiple<ScalarOrObject<string, { MEDI: Medium }>>;
    }
  >;
};

/**
 * Repository record
 */

export type Repository = {
  "@ref": Xref;
  NAME: string;
  ADDR?: Address;
  PHON?: Multiple<string>;
  EMAIL?: Multiple<string>;
  FAX?: Multiple<string>;
  WWW?: Multiple<string>;
} & Optional<Several<Note>> &
  Optional<Several<Identifier>> &
  Optional<ChangeDate> &
  Optional<CreationDate>;
