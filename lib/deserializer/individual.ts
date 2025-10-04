import { Xref } from "../parser/types.ts";
import { Language, Restriction, Sex, IndividualAttributeType, FamilyAttributeType, GenericAttributeType } from "../gedcom/types.ts";
import { ChunkWith, ScalarOrObject, Multiple, Optional, Several, Identifier } from "./types.ts";
import { CreationDate, ChangeDate } from "./date.ts";
import { IndividualEvent, IndividualEventDetail, FamilyEvent, FamilyEventDetail, NonEvent } from "./event.ts";
import { Note } from "./note.ts";
import { SourceCitation } from "./source.ts";
import { Association } from "./association.ts";
import { MultimediaLink } from "./multimedia.ts";

/**
 * Family record
 */

export type FamilyGroup = ChunkWith<
  {
    "@ref": Xref;
    RESN?: string;
  } & {
    [key in FamilyAttributeType]: ScalarOrObject<number, { TYPE?: string } & Partial<FamilyEventDetail>>;
  } & FamilyEvent & {
      NO?: Multiple<NonEvent>;
      HUSB: ScalarOrObject<Xref, { PHRASE?: string }>;
      WIFE: ScalarOrObject<Xref, { PHRASE?: string }>;
      CHIL: Multiple<ScalarOrObject<Xref, { PHRASE?: string }>>;
      SUBM?: Multiple<Xref>;
    } & Optional<Several<Association>> &
    Optional<Several<MultimediaLink>> &
    Optional<Several<Identifier>> &
    Optional<Several<SourceCitation>> &
    Optional<Several<Note>> &
    Optional<ChangeDate> &
    Optional<CreationDate>
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
} & Optional<Several<SourceCitation>> &
  Optional<Several<Note>>;

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
  } & Optional<Several<SourceCitation>> &
    Optional<Several<Note>>
>;

type Pedigree = "adopted" | "birth" | "foster";

type Stat = "CHALLENGED" | "DISPROVEN" | "PROVEN";

export type Individual = ChunkWith<
  {
    "@ref": Xref;
    RESN?: Restriction;
    NAME?: Multiple<Name>;
    SEX?: Sex;
  } & {
    [key in IndividualAttributeType]?: Multiple<ScalarOrObject<string, IndividualEventDetail & { TYPE?: string }>>;
  } & {
    [key in GenericAttributeType]?: Multiple<ScalarOrObject<string, IndividualEventDetail & { TYPE: string }>>;
  } & Optional<Several<IndividualEvent>> & {
      NO?: Multiple<NonEvent>;
      FAMC?: Multiple<
        ScalarOrObject<
          Xref,
          {
            PEDI?: ScalarOrObject<Pedigree, { PHRASE: string }>;
            STAT?: ScalarOrObject<Stat, { PHRASE: string }>;
          } & Optional<Several<Note>>
        >
      >;
      FAMS?: ScalarOrObject<Xref, Optional<Several<Note>>>;
      SUBM?: Xref;
    } & Optional<Several<Association>> & {
      ALIA?: ScalarOrObject<Xref, { PHRASE: string }>;
      ANCI?: Xref;
      DESI?: Xref;
    } & Optional<Several<Identifier>> &
    Optional<Several<Note>> &
    Optional<Several<SourceCitation>> &
    Optional<Several<MultimediaLink>> &
    Optional<ChangeDate> &
    Optional<CreationDate>
>;
