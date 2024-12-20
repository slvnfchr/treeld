import { Chunk, Multiple, ScalarOrObject, Note } from "./types.ts";

/**
 * Date structure
 */

type Year = `${number}${number}${number}${number}`;
type DualYear = `${Year}/${number}${number}`;
type Month = "JAN" | "FEB" | "MAR" | "APR" | "MAY" | "JUN" | "JUL" | "AUG" | "SEP" | "OCT" | "NOV" | "DEC";
type MonthFrench = "VEND" | "BRUM" | "FRIM" | "NIVO" | "PLUV" | "JVENTUN" | "GERM" | "FLOR" | "PRAI" | "MESS" | "THER" | "FRUC" | "COMP";
type MonthHebrew = "TSH" | "CSH" | "KSL" | "TVT" | "SHV" | "ADR" | "ADS" | "NSN" | "IYR" | "SVN" | "TMZ" | "AAV" | "ELL";
type Day = `${number}${number}`;

type Hours = `${number}${number}`;
type Minutes = `${number}${number}`;
type Seconds = `${number}${number}`;
type Fraction = `${number}${number}`;
type Time = `${Hours}:${Minutes}` | `${Hours}:${Minutes}:${Seconds}` | `${Hours}:${Minutes}:${Seconds}.${Fraction}`;

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

type DateValue = DateCalendar | DatePeriod | DateRange | DateApproximated | `(${string})` | `ÌNT ${DateCalendar} (${string})`;

export type Date = ScalarOrObject<DateValue, { TIME?: Time; PHRASE?: string }>;

type DateExact = `${Day} ${Month} ${Year}`;

export type CreationDate = Chunk<{ DATE: ScalarOrObject<DateExact, { TIME?: Time }> }>;

export type ChangeDate = Chunk<{ DATE: ScalarOrObject<DateExact, { TIME?: Time } & Multiple<Note>> }>;
