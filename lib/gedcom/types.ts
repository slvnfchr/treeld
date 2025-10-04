import { Branded } from "../utils/types.ts";
import * as constants from "./constants.js";

/**
 * Date
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#date
 */

type Year = `${number}${number}${number}${number}`;
type DualYear = `${Year}/${number}${number}`;
type Month = "JAN" | "FEB" | "MAR" | "APR" | "MAY" | "JUN" | "JUL" | "AUG" | "SEP" | "OCT" | "NOV" | "DEC";
type MonthFrench = "VEND" | "BRUM" | "FRIM" | "NIVO" | "PLUV" | "JVENTUN" | "GERM" | "FLOR" | "PRAI" | "MESS" | "THER" | "FRUC" | "COMP";
type MonthHebrew = "TSH" | "CSH" | "KSL" | "TVT" | "SHV" | "ADR" | "ADS" | "NSN" | "IYR" | "SVN" | "TMZ" | "AAV" | "ELL";
type Day = `${number}${number}`;

type DateGregorian = `${Year}` | `${Year} ${"BCE" | "BC" | "B.C."}` | `${Month} ${Year}` | `${Day} ${Month} ${Year}` | `${Day} ${Month}` | `${Month} ${DualYear}`;
type DateJulian = `${Year}` | `${Year} ${"BCE" | "BC" | "B.C."}` | `${Month} ${Year}` | `${Day} ${Month} ${Year}` | `${Month} ${DualYear}` | `${Day} ${Month} ${DualYear}`;
type DateHebrew = `${Year}` | `${MonthHebrew} ${Year}` | `${Day} ${MonthHebrew} ${Year}`;
type DateFrench = `${Year}` | `${MonthFrench} ${Year}` | `${Day} ${MonthFrench} ${Year}`;
type DateCalendar =
  | DateGregorian
  | DateJulian
  | DateHebrew
  | DateFrench
  | `@#DGREGORIAN@ ${DateGregorian}`
  | `@#DJULIAN@ ${DateJulian}`
  | `@#DHEBREW@ ${DateHebrew}`
  | `@#DFRENCH R@ ${DateFrench}`
  | `@#DUNKNOWN@ ${string}`;

export type DatePeriod = `FROM ${DateCalendar}` | `TO ${DateCalendar}` | `FROM ${DateCalendar} TO ${DateCalendar}`;

type DateRange = `BEF ${DateCalendar}` | `AFT ${DateCalendar}` | `BET ${DateCalendar} AND ${DateCalendar}`;

type DateApproximated = `ABT ${DateCalendar}` | `CAL ${DateCalendar}` | `EST ${DateCalendar}`;

export type DateValue = DateCalendar | DatePeriod | DateRange | DateApproximated | `(${string})` | `ÌNT ${DateCalendar} (${string})`;

export type DateExact = `${Day} ${Month} ${Year}`;

/**
 * Time
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#time
 */

type Hours = `${number}${number}`;
type Minutes = `${number}${number}`;
type Seconds = `${number}${number}`;
type Fraction = `${number}${number}`;

export type Time = `${Hours}:${Minutes}` | `${Hours}:${Minutes}:${Seconds}` | `${Hours}:${Minutes}:${Seconds}.${Fraction}`;

/**
 * Age
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#age
 */

type AgeBound = "<" | ">";
type AgeDuration =
  | `${number}y`
  | `${number}y ${number}m`
  | `${number}y ${number}m ${number}w`
  | `${number}y ${number}m ${number}w ${number}d`
  | `${number}m`
  | `${number}m ${number}w`
  | `${number}m ${number}w ${number}d`
  | `${number}w`
  | `${number}w ${number}d`
  | `${number}d`;

export type Age = `${AgeDuration}` | `${AgeBound} ${AgeDuration}`;

/**
 * Language
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#language
 */

export type Language = Branded<string, "Language">;

/**
 * MediaType
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#media-type
 */

type IETFTokenType = Branded<string, "IETFTokenType">;
type XTokenType = `x-${string}`;
type ExtensionTokenType = IETFTokenType | XTokenType;
type IANATokenType = Branded<string, "IANATokenType">;

type DiscreteType = "image" | "audio" | "video" | "text" | "application" | ExtensionTokenType;
type CompositeType = "message" | "multipart" | ExtensionTokenType;

type Type = DiscreteType | CompositeType;

type SubType = ExtensionTokenType | IANATokenType;

export type MediaType = `${Type}/${SubType}` | `${Type}/${SubType};${string}`;

/**
 * Events
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#events
 */

export type IndividualEventType = keyof typeof constants.INDIVIDUAL_EVENT;

export type FamilyEventType = keyof typeof constants.FAMILY_EVENT;

export type GenericEventType = typeof constants.EVENT;

export type Adoption = keyof typeof constants.ADOPTION;

/**
 * Attributes
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#attributes
 */

export type IndividualAttributeType = keyof typeof constants.INDIVIDUAL_ATTRIBUTE;

export type FamilyAttributeType = keyof typeof constants.FAMILY_ATTRIBUTE;

export type GenericAttributeType = typeof constants.FACT;

/**
 * Restrictions
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#events
 */

export type Restriction = keyof typeof constants.RESTRICTION;

export type Sex = keyof typeof constants.SEX;

export type Role = keyof typeof constants.ROLE;

export type Medium = keyof typeof constants.MEDIUM;

/**
 * Identifiers
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#IDENTIFIER_STRUCTURE
 */

export type Reference = Branded<number | string, "Reference">;

export type UniqueIdentifier = Branded<string, "UUID">;

export type ExternalIdentifier = Branded<string, "EXID">;
