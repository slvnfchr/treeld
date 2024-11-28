import { Xref } from "../parser/types.ts";
import { Chunk, Language, Multiple, ScalarOrObject, Note, MultimediaLink } from "./types.ts";
import { Date, ChangeDate, CreationDate } from "./date.ts";
import { Place, Address } from "./location.ts";

/**
 * Source citation
 */

type CertaintyAssessment = "0" | "1" | "2" | "3";

export type SourceCitation = ScalarOrObject<
  Xref,
  {
    PAGE?: string;
    DATA?: Chunk<{
      DATE?: Date;
      TEXT?: Multiple<ScalarOrObject<string, { MIME?: string; LANG: Language }>>;
    }>;
    EVEN?: ScalarOrObject<string, { PHRASE?: string; ROLE?: ScalarOrObject<string, { PHRASE: string }> }>;
    QUAY?: CertaintyAssessment;
    OBJE?: Multiple<MultimediaLink>;
    NOTE?: Multiple<Note>;
    SNOTE?: Multiple<Xref>;
  }
>;

/**
 * Source record
 */

export type Source = {
  "@ref": Xref;
  DATA?: Chunk<{
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
    NOTE?: Multiple<Note>;
    SNOTE?: Multiple<Xref>;
  }>;
  AUTH?: string;
  TITL?: string;
  ABBR?: string;
  PUBL?: string;
  TEXT?: ScalarOrObject<string, { MIME: string; LANG: Language }>;
  SOUR?: Multiple<RepositoryCitation>;
  REFN?: ScalarOrObject<string, { TYPE: string }>;
  UID?: string;
  EXID?: ScalarOrObject<string, { TYPE: string }>;
  NOTE?: Multiple<Note>;
  SNOTE?: Multiple<Xref>;
  OBJE?: Multiple<MultimediaLink>;
  CHAN?: ChangeDate;
  CREA?: CreationDate;
};

/**
 * Repository citation
 */

export type RepositoryCitation = ScalarOrObject<
  Xref,
  {
    NOTE?: Multiple<Note>;
    SNOTE?: Multiple<Xref>;
    CALN?: ScalarOrObject<string, { MEDI: ScalarOrObject<string, { PHRASE: string }> }>;
  }
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
  NOTE?: Multiple<Note>;
  SNOTE?: Multiple<Xref>;
  REFN?: ScalarOrObject<string, { TYPE: string }>;
  UID?: string;
  EXID?: ScalarOrObject<string, { TYPE: string }>;
  CHAN?: ChangeDate;
  CREA?: CreationDate;
};
