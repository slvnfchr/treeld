import { Xref } from "../parser/types.ts";

export type Chunk<T extends Object> = {
  "@parent"?: Chunk<Object>;
  "@type": string;
} & T;

export type Language = string;

export type Multiple<T> = T | T[];

export type ScalarOrObject<T, U> =
  | T
  | Chunk<
      {
        "@value": T;
      } & U
    >;

export type WithTranslation<T extends Object> = T & {
  TRAN?: ScalarOrObject<string, { LANG: Language } & T>;
};

export type Note = ScalarOrObject<string, WithTranslation<{ MIME: string }>>;

export type MultimediaLink = ScalarOrObject<
  Xref,
  {
    CROP?: Chunk<{
      TOP: number;
      LEFT: number;
      HEIGHT: number;
      WIDTH: number;
    }>;
    TITL?: string;
  }
>;
