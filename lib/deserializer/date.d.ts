import { Chunk, WithNote } from "./common";

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

export type DateExact = `${number} ${Month} ${number}`;

export type Date = Chunk & {
  "@value": DateCalendar;
  TIME?: Time;
};

type DatePeriod = `FROM ${Date}` | `TO ${Date}` | `FROM ${Date} TO ${Date}`;

type DateRange = `BEF ${Date}` | `AFT ${Date}` | `BET ${Date} AND ${Date}`;

type DateApproximated = `ABT ${Date}` | `CAL ${Date}` | `EST ${Date}`;

export type DateValue = Date | DatePeriod | DateRange | DateApproximated | `(${string})` | `ÌNT ${Date} (${string})`;

type ChangeDate = {
  DATE: {
    "@value": DateExact;
    TIME?: Time;
  };
};

export type WithChangeDate<T extends Chunk> = T & {
  CHAN?: WithNote<ChangeDate>;
};
