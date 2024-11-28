import { Chunk, Note, Language } from "./types.ts";

/**
 * Place structure
 */

type PlaceName = string | `${string}, ${PlaceName}`;

type Variation<T, U> = {
  "@value": T;
  TYPE: string | U;
};

type GeoCoordinates = {
  LATI: `${"N" | "S"}${number}.${number}`;
  LONG: `${"E" | "W"}${number}.${number}`;
};

export type Place = Chunk<{
  "@value": PlaceName;
  FORM?: PlaceName;
  LANG: Language;
  FONE?: Variation<PlaceName, "Hangul" | "kana">; // TODO handle multiple phonetisation
  ROMN?: Variation<PlaceName, "pinyin" | "romaji" | "wadegiles">; // TODO handle multiple romanisation
  MAP?: GeoCoordinates;
  NOTE?: Note;
}>;

/**
 * Address structure
 */

export type Address = Chunk<{
  ADR1?: string;
  ADR2?: string;
  ADR3?: string;
  CITY?: string;
  STAE?: string;
  POST?: string;
  CTRY?: string;
}>;
