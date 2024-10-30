import { Xref, Chunk, WithNote, WithMultimedia } from "./common";
import { WithChangeDate } from "./date";
import { WithEvent, WithFamilyEvent } from "./event";
import { WithSourceCitation } from "./source";

type WithFamilyAttribute<T extends Chunk> = T & {
  NCHI?:
    | number
    | WithFamilyEvent<{
        "@value": number;
        TYPE: string;
      }>;
  RESI?:
    | string
    | WithFamilyEvent<{
        "@value": number;
        TYPE: string;
      }>;
  FACT?:
    | string
    | WithFamilyEvent<{
        "@value": number;
        TYPE: string;
      }>;
};

type WithAssociation<T extends Chunk> = T & {
  ASSO?: WithNote<
    WithSourceCitation<{
      "@value": Xref;
      RELA: "godfather" | "godmother" | "attendant" | "informant" | "witness" | "other" | string;
    }>
  >;
};

export type FamilyGroup = Chunk &
  WithFamilyAttribute<
    WithFamilyEvent<
      WithChangeDate<
        WithNote<
          WithSourceCitation<
            WithMultimedia<{
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
            }>
          >
        >
      >
    >
  >;

type IndividualAttribute = WithEvent<{
  "@value": string;
  TYPE?: string;
}>;

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

export type Person = Chunk &
  WithEvent<
    WithAttribute<
      WithAssociation<
        WithChangeDate<
          WithNote<
            WithSourceCitation<
              WithMultimedia<{
                "@ref": Xref;
                NAME?: string;
                SEX?: "U" | "M" | "F" | "X" | "N";
                FAMC?: WithNote<{
                  "@value": string;
                  PEDI?: "adopted" | "birth" | "foster";
                }>;
                FAMS?: WithNote<{
                  "@value": string;
                }>;
                REFN?: {
                  "@value": string;
                  TYPE?: string;
                };
                RIN?: string;
              }>
            >
          >
        >
      >
    >
  >;
