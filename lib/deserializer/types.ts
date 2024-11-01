import { Xref } from "../parser/types.ts";

export type Chunk = {
  "@parent"?: Chunk;
  "@type": string;
};

export type Note = Xref | string;

export type WithNote<T extends Chunk> = T & {
  NOTE?: Note;
};

export type WithMultimedia<T extends Chunk> = T & {
  OBJE?: Xref;
};
