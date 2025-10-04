import { Xref } from "../parser/types.ts";
import { Language, Restriction, Sex, IndividualAttributeType, FamilyAttributeType, GenericAttributeType } from "../gedcom/types.ts";
import { ChunkWith, ScalarOrObject, Multiple, MultimediaLink } from "./types.ts";
import { CreationDate, ChangeDate } from "./date.ts";
import { IndividualEvent, IndividualEventDetail, FamilyEvent, FamilyEventDetail, NonEvent } from "./event.ts";
import { Note } from "./note.ts";
import { SourceCitation } from "./source.ts";
import { Association } from "./association.ts";

/**
 * Family record
 */

export type FamilyGroup = ChunkWith<
  {
    "@ref": Xref;
    RESN?: string;
    [key in FamilyAttributeType]: ScalarOrObject<number, { TYPE?: string } & Partial<FamilyEventDetail>>;
    FACT?: ScalarOrObject<string, { TYPE: string } & Partial<FamilyEventDetail>>;
    NO?: Multiple<NonEvent>;
    HUSB: ScalarOrObject<Xref, { PHRASE?: string }>;
    WIFE: ScalarOrObject<Xref, { PHRASE?: string }>;
    CHIL: Multiple<ScalarOrObject<Xref, { PHRASE?: string }>>;
    ASSO?: Multiple<Association>;
    SUBM?: Xref;
    REFN?: ScalarOrObject<string, { TYPE: string }>;
    UID?: string;
    EXID?: ScalarOrObject<string, { TYPE: string }>;
    OBJE?: Multiple<MultimediaLink>;
  } & FamilyEvent &
    Note &
    SourceCitation &
    ChangeDate &
    CreationDate
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
} & SourceCitation &
  Note;

type Name = ScalarOrObject<
  string,
  {
    TYPE?: ScalarOrObject<string, { PHRASE: string }>;
    TRAN?: Multiple<
      ChunkWith<
        {
          "@value": string;
          LANG: Language;
        } & NamesPieces
      >
    >;
  } & SourceCitation &
    Note
>;

type Pedigree = "adopted" | "birth" | "foster";

type Stat = "CHALLENGED" | "DISPROVEN" | "PROVEN";

export type Individual = ChunkWith<
  {
    "@ref": Xref;
    RESN?: Restriction;
    NAME?: Multiple<Name>;
    SEX?: Sex;
    [key in IndividualAttributeType]?: Multiple<ScalarOrObject<string, IndividualEventDetail & { TYPE?: string }>>;
    [key in GenericAttributeType]?: Multiple<ScalarOrObject<string, IndividualEventDetail & { TYPE: string }>>;
    NO?: Multiple<NonEvent>;
    FAMC?: Multiple<
      ScalarOrObject<
        Xref,
        {
          PEDI?: ScalarOrObject<Pedigree, { PHRASE: string }>;
          STAT?: ScalarOrObject<Stat, { PHRASE: string }>;
        } & Note
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
    OBJE?: Multiple<MultimediaLink>;
  } & IndividualEvent &
    SourceCitation &
    Note &
    ChangeDate &
    CreationDate
>;
