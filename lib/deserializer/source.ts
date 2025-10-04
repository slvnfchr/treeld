import { Xref } from "../parser/types.ts";
import { ChunkWith, Multiple, ScalarOrObject, MultimediaLink } from "./types.ts";
import { Language, MediaType } from "../gedcom/types.ts";
import { Note } from "./note.ts";
import { Date, ChangeDate, CreationDate } from "./date.ts";
import { Place, Address } from "./location.ts";

/**
 * Source citation
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
          TEXT?: Multiple<ScalarOrObject<string, { MIME?: MediaType; LANG: Language }>>;
        }>;
        EVEN?: ScalarOrObject<string, { PHRASE?: string; ROLE?: ScalarOrObject<string, { PHRASE: string }> }>;
        QUAY?: CertaintyAssessment;
        OBJE?: Multiple<MultimediaLink>;
      } & Note
    >
  >;
};

/**
 * Source record
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
    } & Note
  >;
  AUTH?: string;
  TITL?: string;
  ABBR?: string;
  PUBL?: string;
  TEXT?: ScalarOrObject<string, { MIME: MediaType; LANG: Language }>;
  SOUR?: Multiple<RepositoryCitation>;
  REFN?: ScalarOrObject<string, { TYPE: string }>;
  UID?: string;
  EXID?: ScalarOrObject<string, { TYPE: string }>;
  OBJE?: Multiple<MultimediaLink>;
} & Note &
  ChangeDate &
  CreationDate;

/**
 * Repository citation
 */

export type RepositoryCitation = ScalarOrObject<
  Xref,
  {
    CALN?: ScalarOrObject<string, { MEDI: ScalarOrObject<string, { PHRASE: string }> }>;
  } & Note
>;

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
  REFN?: ScalarOrObject<string, { TYPE: string }>;
  UID?: string;
  EXID?: ScalarOrObject<string, { TYPE: string }>;
} & Note &
  ChangeDate &
  CreationDate;
