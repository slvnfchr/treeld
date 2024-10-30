import { WithContext, Thing } from "./context/schema";

type ObjectTypes = {
  [k: string]: string;
};

export type Vocabulary = {
  URI: string;
  PREFIX: string;
  TYPES: ObjectTypes;
};

export const schema: Vocabulary;
export const bio: Vocabulary;
export const rdfs: Vocabulary;
export const dc: Vocabulary;
export const dcmitype: Vocabulary;

export class Context {
  constructor(obj: Object);
  obj: Object;
  vocabularies: Vocabulary[];
  setDefault(vocabulary: Vocabulary): void;
  getDefault(): Vocabulary;
  addVocabulary(vocabulary: Vocabulary): void;
  removeVocabulary(vocabulary: Vocabulary): void;
  add(property: Record<string, string | object>): void;
  remove(property: Record<string, string | object>): void;
}

export type ObjectLD<T> = {
  type: string;
  context: Context;
  [k: string]: string | object;
} & WithContext<T>;

export function createObject(vocabulary: Vocabulary, src?: Object): ObjectLD<Thing>;

export function isObject(obj: Object, type?: string): boolean;

export function mapProperties(source: Object, target: Object, map: Record<string, object | string>): void;

export function flatten(obj: Object, nae: string): void;
