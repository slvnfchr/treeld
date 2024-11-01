import { Xref } from "../parser/types.ts";
import { Chunk, WithNote, WithMultimedia } from "./types.ts";
import { DateValue, WithChangeDate } from "./date.ts";
import { Place, WithAddress } from "./location.ts";

/**
 * Source citation
 */

type CertaintyAssessment = "0" | "1" | "2" | "3";

export type SourceCitation = WithNote<
  WithMultimedia<
    Chunk & {
      "@value": Xref;
      PAGE?: string;
      EVEN?:
        | string
        | (Chunk & {
            "@value": string;
            ROLE?: string;
          });
      DATA?: {
        DATE?: DateValue;
        TEXT?: string;
      };
      QUAY?: CertaintyAssessment;
    }
  >
>;

export type WithSourceCitation<T extends Chunk> = T & {
  SOUR?: SourceCitation;
};

/**
 * Source record
 */

export type Source = WithChangeDate<
  WithNote<
    WithMultimedia<
      Chunk & {
        "@ref": Xref;
        DATA?: WithNote<
          Chunk & {
            EVEN?: {
              "@value": string;
              DATE?: DateValue;
              PLAC?: Place;
            };
            AGNC?: string;
          }
        >;
        AUTH?: string;
        TITL?: string;
        ABBR?: string;
        PUBL?: string;
        TEXT?: string;
        SOUR?: RepositoryCitation;
        REFN?: Chunk & {
          "@value": string;
          TYPE?: string;
        };
        RIN?: string;
      }
    >
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

export type Repository = WithAddress<
  WithNote<
    WithChangeDate<
      Chunk & {
        "@ref": Xref;
        NAME: string;
        REFN?: Chunk & {
          "@value": string;
          TYPE: string;
        };
        RIN?: string;
      }
    >
  >
>;
