import { ChunkWith, Optional, Several } from "./types.ts";
import { Language } from "../gedcom/types.ts";
import { Note } from "./note.ts";

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

export type Place = ChunkWith<
  {
    "@value": PlaceName;
    FORM?: PlaceName;
    LANG: Language;
    FONE?: Variation<PlaceName, "Hangul" | "kana">; // TODO handle multiple phonetisation
    ROMN?: Variation<PlaceName, "pinyin" | "romaji" | "wadegiles">; // TODO handle multiple romanisation
    MAP?: GeoCoordinates;
  } & Optional<Several<Note>>
>;

/**
 * Address structure
 */

export type Address = ChunkWith<{
  ADR1?: string;
  ADR2?: string;
  ADR3?: string;
  CITY?: string;
  STAE?: string;
  POST?: string;
  CTRY?: string;
}>;
