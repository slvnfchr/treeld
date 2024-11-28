import { Xref } from "../parser/types.ts";
import { Chunk, ScalarOrObject, Multiple, Language, Note, MultimediaLink } from "./types.ts";
import { CreationDate, ChangeDate } from "./date.ts";
import { IndividualEvent, IndividualEventDetail, FamilyEvent, FamilyEventDetail, NonEvent } from "./event.ts";
import { SourceCitation } from "./source.ts";
import { Association } from "./association.ts";

/**
 * Family record
 */

export type FamilyGroup = Chunk<
  {
    "@ref": Xref;
    RESN?: string;
    NCHI?: ScalarOrObject<number, { TYPE: string } & FamilyEventDetail>;
    RESI?: ScalarOrObject<string, { TYPE: string } & FamilyEventDetail>;
    FACT?: ScalarOrObject<string, { TYPE: string } & FamilyEventDetail>;
    NO?: Multiple<NonEvent>;
    HUSB: ScalarOrObject<Xref, { PHRASE?: string }>;
    WIFE: ScalarOrObject<Xref, { PHRASE?: string }>;
    CHIL: Multiple<ScalarOrObject<Xref, { PHRASE?: string }>>;
    ASSO?: Multiple<Association>;
    SUBM?: Xref;
    REFN?: ScalarOrObject<string, { TYPE: string }>;
    UID?: string;
    EXID?: ScalarOrObject<string, { TYPE: string }>;
    NOTE?: Multiple<Note>;
    SNOTE?: Multiple<Xref>;
    SOUR?: Multiple<SourceCitation>;
    OBJE?: Multiple<MultimediaLink>;
    CHAN?: ChangeDate;
    CREA?: CreationDate;
  } & FamilyEvent
>;

/**
 * Individual record
 */

type NamesPieces = {
  NPFX?: Multiple<string>;
  GIVN?: Multiple<string>;
  NICK?: Multiple<string>;
  SPFX?: Multiple<string>;
  SURN?: Multiple<string>;
  NSFX?: Multiple<string>;
  SOUR?: Multiple<SourceCitation>;
  NOTE?: Multiple<Note>;
  SNOTE?: Multiple<Xref>;
};

type Name = ScalarOrObject<
  string,
  {
    TYPE?: ScalarOrObject<string, { PHRASE: string }>;
    TRAN?: Multiple<
      Chunk<
        {
          "@value": string;
          LANG: Language;
        } & NamesPieces
      >
    >;
    SOUR?: Multiple<SourceCitation>;
    NOTE?: Multiple<Note>;
    SNOTE?: Multiple<Xref>;
  }
>;

type IndividualAttribute<T = string> = ScalarOrObject<T, IndividualEventDetail & { TYPE?: string }>;

type Pedigree = "adopted" | "birth" | "foster";

type Stat = "CHALLENGED" | "DISPROVEN" | "PROVEN";

export type Individual = Chunk<
  {
    "@ref": Xref;
    RESN?: string;
    NAME?: Multiple<Name>;
    SEX?: "M" | "F" | "X" | "U";
    CAST?: Multiple<IndividualAttribute<string>>;
    DSCR?: Multiple<IndividualAttribute<string>>;
    EDUC?: Multiple<IndividualAttribute<string>>;
    IDNO?: Multiple<IndividualAttribute<string>>;
    NATI?: Multiple<IndividualAttribute<string>>;
    NCHI?: Multiple<IndividualAttribute<number>>;
    NMR?: Multiple<IndividualAttribute<number>>;
    OCCU?: Multiple<IndividualAttribute<string>>;
    PROP?: Multiple<IndividualAttribute<string>>;
    RELI?: Multiple<IndividualAttribute<string>>;
    RESI?: Multiple<IndividualAttribute<string>>;
    SSN?: Multiple<IndividualAttribute<string>>;
    TITL?: Multiple<IndividualAttribute<string>>;
    FACT?: Multiple<IndividualAttribute<string>>;
    NO?: Multiple<NonEvent>;
    FAMC?: Multiple<
      ScalarOrObject<
        Xref,
        {
          PEDI?: ScalarOrObject<Pedigree, { PHRASE: string }>;
          STAT?: ScalarOrObject<Stat, { PHRASE: string }>;
          NOTE?: Multiple<Note>;
          SNOTE?: Multiple<Xref>;
        }
      >
    >;
    FAMS?: ScalarOrObject<Xref, { NOTE?: Multiple<Note>; SNOTE?: Multiple<Xref> }>;
    SUBM?: Xref;
    ASSO?: Multiple<Association>;
    ALIA?: ScalarOrObject<Xref, { PHRASE: string }>;
    ANCI?: Xref;
    DESI?: Xref;
    REFN?: ScalarOrObject<string, { TYPE: string }>;
    UID?: string;
    EXID?: ScalarOrObject<string, { TYPE: string }>;
    NOTE?: Multiple<Note>;
    SNOTE?: Multiple<Xref>;
    SOUR?: Multiple<SourceCitation>;
    OBJE?: Multiple<MultimediaLink>;
    CHAN?: ChangeDate;
    CREA?: CreationDate;
  } & IndividualEvent
>;
