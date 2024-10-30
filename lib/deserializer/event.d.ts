import { Chunk, WithNote, WithMultimedia } from "./common";
import { DateValue } from "./date";
import { WithAddress } from "./location";

/**
 * Event structure
 */

type EventDetail = Chunk &
  WithAddress<
    WithNote<
      WithMultimedia<{
        TYPE?: string;
        DATE?: DateValue;
        PLAC?: Place;
        AGNC?: string;
        RELI?: string;
        CAUS?: string;
      }>
    >
  >;

export type WithEvent<T extends Chunk> = T & {
  BIRT?: EventDetail & { FAMC?: Xref };
  CHR?: EventDetail & { FAMC?: Xref };
  DEAT?: EventDetail;
  BURI?: EventDetail;
  CREM?: EventDetail;
  ADOP?: EventDetail & { FAMC?: { "@value": Xref; ADOP?: "HUSB" | "WIFE" | "BOTH" } };
  BAPM?: EventDetail;
  BAPM?: EventDetail;
  BARM: EventDetail;
  BASM?: EventDetail;
  CHRA?: EventDetail;
  CONF?: EventDetail;
  FCOM?: EventDetail;
  NATU?: EventDetail;
  EMIG?: EventDetail;
  IMMI?: EventDetail;
  CENS?: EventDetail;
  PROB?: EventDetail;
  WILL?: EventDetail;
  GRAD?: EventDetail;
  RETI?: EventDetail;
  EVEN?: {
    "@value": string;
  } & EventDetail;
};

type FamilyEventDetail = {
  HUSB?: {
    AGE: number;
  };
  WIFE?: {
    AGE: number;
  };
} & EventDetail;

export type WithFamilyEvent<T extends Chunk> = T & {
  ANUL?: FamilyEventDetail;
  CENS?: FamilyEventDetail;
  DIV?: FamilyEventDetail;
  DIVF?: FamilyEventDetail;
  ENGA?: FamilyEventDetail;
  MARB?: FamilyEventDetail;
  MARC?: FamilyEventDetail;
  MARR?: FamilyEventDetail;
  MARL?: FamilyEventDetail;
  MARS?: FamilyEventDetail;
  RESI?: FamilyEventDetail;
  EVEN?: {
    "@value": string;
  } & FamilyEventDetail;
};
