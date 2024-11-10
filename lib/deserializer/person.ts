import { Xref } from "../parser/types.ts";
import { Chunk, WithNote, WithMultimedia } from "./types.ts";
import { WithChangeDate } from "./date.ts";
import { WithEvent, WithFamilyEvent } from "./event.ts";
import { WithSourceCitation } from "./source.ts";

type WithFamilyAttribute<T extends Chunk> = T & {
  NCHI?:
    | number
    | WithFamilyEvent<
        Chunk & {
          "@value": number;
          TYPE: string;
        }
      >;
  RESI?:
    | string
    | WithFamilyEvent<
        Chunk & {
          "@value": number;
          TYPE: string;
        }
      >;
  FACT?:
    | string
    | WithFamilyEvent<
        Chunk & {
          "@value": number;
          TYPE: string;
        }
      >;
};

type WithAssociation<T extends Chunk> = T & {
  ASSO?: WithNote<
    WithSourceCitation<
      Chunk & {
        "@value": Xref;
        RELA: "godfather" | "godmother" | "attendant" | "informant" | "witness" | "other" | string;
      }
    >
  >;
};

export type FamilyGroup = WithFamilyAttribute<
  WithFamilyEvent<
    WithChangeDate<
      WithNote<
        WithSourceCitation<
          WithMultimedia<
            Chunk & {
              "@ref": Xref;
              HUSB:
                | Xref
                | {
                    "@value": Xref;
                    PHRASE?: string;
                  };
              WIFE:
                | Xref
                | {
                    "@value": Xref;
                    PHRASE?: string;
                  };
              CHIL:
                | Xref
                | {
                    "@value": Xref;
                    PHRASE?: string;
                  };
              REFN?: {
                "@value": string;
                TYPE?: string;
              };
              RIN?: string;
            }
          >
        >
      >
    >
  >
>;

type IndividualAttribute = WithEvent<
  Chunk & {
    "@value": string;
    TYPE?: string;
  }
>;

export type WithAttribute<T extends Chunk> = T & {
  CAST?: IndividualAttribute;
  DSCR?: IndividualAttribute;
  EDUC?: IndividualAttribute;
  IDNO?: IndividualAttribute;
  NATI?: IndividualAttribute;
  NCHI?: IndividualAttribute;
  NMR?: IndividualAttribute;
  OCCU?: IndividualAttribute;
  PROP?: IndividualAttribute;
  RELI?: IndividualAttribute;
  RESI?: IndividualAttribute;
  TITL?: IndividualAttribute;
  FACT?: IndividualAttribute;
};

type WithNamesPieces<T extends Chunk> = T &
  WithNote<
    WithSourceCitation<
      Chunk & {
        NPFX?: string;
        GIVN?: string;
        NICK?: string;
        SPFX?: string;
        SURN?: string;
        NSFX?: string;
      }
    >
  >;

export type Person = WithEvent<
  WithAttribute<
    WithAssociation<
      WithChangeDate<
        WithNote<
          WithSourceCitation<
            WithMultimedia<
              Chunk & {
                "@ref": Xref;
                NAME?: WithNote<
                  WithSourceCitation<
                    WithNamesPieces<
                      Chunk & {
                        "@value": string;
                        TYPE?: string;
                        FONE?: WithNamesPieces<
                          Chunk & {
                            "@value": string;
                            TYPE: string;
                          }
                        >;
                        ROMN?: WithNamesPieces<
                          Chunk & {
                            "@value": string;
                            TYPE: string;
                          }
                        >;
                      }
                    >
                  >
                >;
                SEX?: "U" | "M" | "F" | "X" | "N";
                FAMC?: WithNote<
                  Chunk & {
                    "@value": string;
                    PEDI?: "adopted" | "birth" | "foster";
                  }
                >;
                FAMS?: WithNote<
                  Chunk & {
                    "@value": string;
                  }
                >;
                REFN?: {
                  "@value": string;
                  TYPE?: string;
                };
                RIN?: string;
              }
            >
          >
        >
      >
    >
  >
>;
