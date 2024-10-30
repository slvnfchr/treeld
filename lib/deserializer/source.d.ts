import { Xref } from "../parser";
import { Chunk, WithNote, WithMultimedia } from "./common";
import { DateValue, DatePeriod, WithChangeDate } from "./date";
import { Place, WithAddress } from "./location";

/**
 * Source citation
 */

type CertaintyAssessment = "0" | "1" | "2" | "3";

export type SourceCitation = Chunk &
  WithNote<
    WithMultimedia<{
      "@value": Xref;
      PAGE?: string;
      EVEN?:
        | string
        | {
            "@value": string;
            ROLE?: string;
          };
      DATA?: {
        DATE?: DateValue;
        TEXT?: string;
      };
      QUAY?: CertaintyAssessment;
    }>
  >;

export type WithSourceCitation<T extends Chunk> = T & {
  SOUR?: WithNote<ChangeDate>;
};

/**
 * Source record
 */

export type Source = Chunk &
  WithChangeDate<
    WithNote<
      WithMultimedia<{
        "@ref": Xref;
        DATA?: WithNote<{
          EVEN?: {
            "@value": string;
            DATE?: DatePeriod;
            PLAC?: Place;
          };
          AGNC?: string;
        }>;
        AUTH?: string;
        TITL?: string;
        ABBR?: string;
        PUBL?: string;
        TEXT?: string;
        SOUR?: RepositoryCitation;
        REFN?: {
          "@value": string;
          TYPE?: string;
        };
        RIN?: string;
      }>
    >
  >;

/**
 * Repository citation
 */

export type RepositoryCitation = Chunk & {
  "@value": Xref;
  CALN?: string;
};

/**
 * Repository record
 */

export type Repository = Chunk &
  WithAddress<
    WithNote<
      WithChangeDate<{
        "@ref": Xref;
        NAME: string;
        REFN?: {
          "@value": string;
          TYPE: string;
        };
        RIN?: string;
      }>
    >
  >;
