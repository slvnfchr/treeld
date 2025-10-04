import { Xref, Tag } from "../parser/types.ts";
import { Language, Reference, UniqueIdentifier, ExternalIdentifier, Role as RoleIdentifier, Medium as MediumIdentifier } from "../gedcom/types.ts";
import { URI } from "../utils/types.ts";

export type Chunk = {
  "@parent"?: Chunk;
  "@type": Tag;
  "@index"?: number;
  [key: Tag]: string | string[] | Chunk | Chunk[];
};

export type ChunkWith<T extends Object> = Chunk & T;

export type Multiple<T> = T | T[];

/**
 * Cardinality
 */

export type Required<T> = T;

export type Optional<T> = {} | T;

type AnyNumber<T> = {
  [K in keyof T]: Multiple<T[K]>;
};

export type Several<T> = Optional<AnyNumber<T>>;

export type ScalarOrObject<T, U> =
  | T
  | ChunkWith<
      {
        "@value": T;
      } & U
    >;

export type WithTranslation<T extends Object> = T & {
  TRAN?: ScalarOrObject<string, { LANG: Language } & T>;
};

/**
 * see https://gedcom.io/specifications/FamilySearchGEDCOMv7.html#IDENTIFIER_STRUCTURE
 */

export type Identifier =
  | {
      REFN: ScalarOrObject<Reference, { TYPE: string }>;
    }
  | {
      UID: UniqueIdentifier;
    }
  | {
      EXID: ScalarOrObject<ExternalIdentifier, { TYPE: URI }>;
    };

export type Role = ScalarOrObject<"OTHER", { PHRASE: string }> | ScalarOrObject<Exclude<RoleIdentifier, "OTHER">, { PHRASE?: string }>;

export type Medium = ScalarOrObject<"OTHER", { PHRASE: string }> | ScalarOrObject<Exclude<MediumIdentifier, "OTHER">, { PHRASE?: string }>;
