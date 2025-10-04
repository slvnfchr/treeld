import { Xref } from "../parser/types.ts";
import { ChunkWith, ScalarOrObject, Multiple, Optional, Several } from "./types.ts";
import { DatePeriod, Age, Adoption, IndividualEventType, FamilyEventType, GenericEventType, UniqueIdentifier } from "../gedcom/types.ts";
import { Date } from "./date.ts";
import { Address, Place } from "./location.ts";
import { Note } from "./note.ts";
import { Association } from "./association.ts";
import { SourceCitation } from "./source.ts";
import { MultimediaLink } from "./multimedia.ts";

/**
 * Event structure
 */

export type EventDetail = {
  DATE?: Date;
  PLAC?: Place;
  ADDR?: Address;
  PHON?: Multiple<string>;
  EMAIL?: Multiple<string>;
  FAX?: Multiple<string>;
  WWW?: Multiple<string>;
  AGNC?: string;
  RELI?: string;
  CAUS?: string;
  RESN?: string;
  SDATE?: Date;
  UID?: Multiple<UniqueIdentifier>;
} & Optional<Several<Association>> &
  Optional<Several<MultimediaLink>> &
  Optional<Several<SourceCitation>> &
  Optional<Several<Note>>;

export type IndividualEventDetail<T = {}> = ChunkWith<
  EventDetail & {
    AGE?: ScalarOrObject<Age, { PHRASE: string }>;
  } & T
>;

export type IndividualEvent =
  | {
      [key in IndividualEventType]: IndividualEventDetail<{ TYPE?: string }>;
    }
  | {
      [key in "BIRT" | "CHR"]: IndividualEventDetail<{ TYPE?: string; FAMC?: Xref }>;
    }
  | {
      ADOP: IndividualEventDetail<{ TYPE?: string; FAMC?: ScalarOrObject<Xref, { ADOP?: ScalarOrObject<Adoption, { PHRASE: string }> }> }>;
    }
  | {
      [key in GenericEventType]: IndividualEventDetail<{ TYPE: string }>;
    };

export type FamilyEventDetail = ChunkWith<
  {
    HUSB?: {
      AGE: ScalarOrObject<Age, { PHRASE: string }>;
    };
    WIFE?: {
      AGE: ScalarOrObject<Age, { PHRASE: string }>;
    };
  } & EventDetail
>;

export type FamilyEvent =
  | {
      [key in FamilyEventType]: Multiple<FamilyEventDetail>;
    }
  | {
      [key in GenericEventType]: Multiple<ScalarOrObject<string, FamilyEventDetail>>;
    };

export type NonEvent = {
  NO: ChunkWith<
    {
      DATE?: ScalarOrObject<DatePeriod, { PHRASE?: string }>;
    } & Optional<Several<Note>> &
      Optional<Several<SourceCitation>>
  >;
};
