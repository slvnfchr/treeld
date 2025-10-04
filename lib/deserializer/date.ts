import { ChunkWith, ScalarOrObject } from "./types.ts";
import { DateExact, DateValue, Time, Age as AgeValue } from "../gedcom/types.ts";
import { Note } from "./note.ts";

export type Date = ScalarOrObject<DateValue, { TIME?: Time; PHRASE?: string }>;

export type CreationDate = { CREA: ChunkWith<{ DATE: ScalarOrObject<DateExact, { TIME?: Time }> }> };

export type ChangeDate = { CHAN: ChunkWith<{ DATE: ScalarOrObject<DateExact, { TIME?: Time } & Note> }> };

export type Age = ScalarOrObject<AgeValue, { PHRASE: string }>;
