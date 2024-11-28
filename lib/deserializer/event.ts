import { Xref } from "../parser/types.ts";
import { Chunk, ScalarOrObject, Note, MultimediaLink, Multiple } from "./types.ts";
import { Date, DatePeriod } from "./date.ts";
import { Address, Place } from "./location.ts";
import { Association } from "./association.ts";
import { SourceCitation } from "./source.ts";

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
  ASSO?: Multiple<Association>;
  NOTE?: Multiple<Note>;
  SNOTE?: Multiple<Xref>;
  SOUR?: Multiple<SourceCitation>;
  OBJE?: Multiple<MultimediaLink>;
  UID?: Multiple<string>;
};

type AgeValue = `${number}y` | `${number}m` | `${number}w` | `${number}d`;
type Age = `${AgeValue}` | `<${AgeValue}` | `>${AgeValue}`;

export type IndividualEventDetail = EventDetail & {
  AGE?: ScalarOrObject<Age, { PHRASE: string }>;
};

type Adoption = "HUSB" | "WIFE" | "BOTH";

type IndividualEventBase<T = {}> = Chunk<IndividualEventDetail & { TYPE?: string } & T>;

export type IndividualEvent = {
  ADOP?: IndividualEventBase<{ FAMC?: ScalarOrObject<Xref, { ADOP?: ScalarOrObject<Adoption, { PHRASE: string }> }> }>;
  BAPM?: IndividualEventBase;
  BARM: IndividualEventBase;
  BASM?: IndividualEventBase;
  BIRT?: IndividualEventBase<{ FAMC?: Xref }>;
  BLES?: IndividualEventBase;
  BURI?: IndividualEventBase;
  CENS?: IndividualEventBase;
  CHR?: IndividualEventBase<{ FAMC?: Xref }>;
  CHRA?: IndividualEventBase;
  CONF?: IndividualEventBase;
  CREM?: IndividualEventBase;
  DEAT?: IndividualEventBase;
  EMIG?: IndividualEventBase;
  FCOM?: IndividualEventBase;
  GRAD?: IndividualEventBase;
  IMMI?: IndividualEventBase;
  NATU?: IndividualEventBase;
  ORDN?: IndividualEventBase;
  PROB?: IndividualEventBase;
  RETI?: IndividualEventBase;
  WILL?: IndividualEventBase;
  EVEN?: IndividualEventBase<{ TYPE: string }>;
};

export type FamilyEventDetail = Chunk<
  {
    HUSB?: {
      AGE: ScalarOrObject<Age, { PHRASE: string }>;
    };
    WIFE?: {
      AGE: ScalarOrObject<Age, { PHRASE: string }>;
    };
  } & EventDetail
>;

export type FamilyEvent = {
  ANUL?: Multiple<FamilyEventDetail>;
  CENS?: Multiple<FamilyEventDetail>;
  DIV?: Multiple<FamilyEventDetail>;
  DIVF?: Multiple<FamilyEventDetail>;
  ENGA?: Multiple<FamilyEventDetail>;
  MARB?: Multiple<FamilyEventDetail>;
  MARC?: Multiple<FamilyEventDetail>;
  MARR?: Multiple<FamilyEventDetail>;
  MARL?: Multiple<FamilyEventDetail>;
  MARS?: Multiple<FamilyEventDetail>;
  RESI?: Multiple<FamilyEventDetail>;
  EVEN?: Multiple<ScalarOrObject<string, FamilyEventDetail>>;
};

export type NonEvent = Chunk<{
  DATE?: ScalarOrObject<DatePeriod, { PHRASE?: string }>;
  NOTE?: Multiple<Note>;
  SNOTE?: Multiple<Xref>;
  SOUR?: Multiple<SourceCitation>;
}>;
