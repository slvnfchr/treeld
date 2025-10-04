import { Xref, Tag } from "../parser/types.ts";
import { Language } from "../gedcom/types.ts";

export type Chunk = {
  "@parent"?: Chunk;
  "@type": Tag;
  "@index"?: number;
  [key: Tag]: string | string[] | Chunk | Chunk[];
};

export type ChunkWith<T extends Object> = Chunk & T;

export type Multiple<T> = T | T[];

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

export type MultimediaLink = ScalarOrObject<
  Xref,
  {
    CROP?: ChunkWith<{
      TOP: number;
      LEFT: number;
      HEIGHT: number;
      WIDTH: number;
    }>;
    TITL?: string;
  }
>;
