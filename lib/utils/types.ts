export type Branded<T, B> = T & { __brand: B };

export type URI = Branded<`http${string}`, "URI">;
