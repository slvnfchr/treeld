export type Chunk = {
  "@parent"?: Chunk;
  "@type": string;
  [k: string]: string | object;
};

export default class Deserializer extends TransformStream {}
