import { Chunk } from "../deserializer/types";
import { WithContext, Thing, PostalAddress, Event, Place, ArchiveOrganization, ArchiveComponent } from "schema-dts";

type ObjectTypes = {
  [k: string]: string;
};

export type Vocabulary = {
  URI: string;
  PREFIX: string;
  TYPES: ObjectTypes;
};

export type Context = {
  obj: Object;
  vocabularies: Vocabulary[];
  setDefault(vocabulary: Vocabulary): void;
  getDefault(): Vocabulary;
  addVocabulary(vocabulary: Vocabulary): void;
  removeVocabulary(vocabulary: Vocabulary): void;
  add(property: Record<string, string | object>): void;
  remove(property: Record<string, string | object>): void;
};

export type ObjectLD<T = Thing> = {
  type: string;
  context: Context;
  [k: string]: string | object;
} & WithContext<T>;

export type ConversionResult<T> = {
  value: T | null;
  info?: object | string;
  warn?: object | string;
  error?: Error;
};

export type ConversionLogger = {
  info: Function;
  warn: Function;
  error: Function;
};

export type Converter<T> = (obj: Chunk, controller: TransformStreamDefaultController) => ConversionResult<T>;

export type ConversionMap = Map<string, Function>;

export type AddressLD = ObjectLD<PostalAddress>;

type Year = `${number}${number}${number}${number}`;
type Month = `${number}${number}`;
type Day = `${number}${number}`;
type Hours = `${number}${number}`;
type Minutes = `${number}${number}`;
type Seconds = `${number}${number}`;
type Milliseconds = `${number}${number}${number}`;
type DateISODate = `${Year}-${Month}-${Day}`;
type DateISOTime = `${Hours}:${Minutes}:${Seconds}.${Milliseconds}`;
export type DateISO = `${DateISODate}T${DateISOTime}Z`;

export type EventLD = ObjectLD<Event>;

export type PlaceLD = ObjectLD<Place>;

export type RepositoryLD = ObjectLD<ArchiveOrganization>;

export type SourceLD = ObjectLD<ArchiveComponent>;
