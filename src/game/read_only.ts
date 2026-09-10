// A live observation view: the simulation owns mutation, consumers only read.
export type ReadOnly<T> = T extends string | number | boolean | bigint | symbol | null | undefined
  ? T
  : T extends ReadonlyMap<infer Key, infer Value>
    ? ReadonlyMap<Key, ReadOnly<Value>>
    : T extends ReadonlySet<infer Value>
      ? ReadonlySet<ReadOnly<Value>>
      : T extends readonly (infer Value)[]
        ? readonly ReadOnly<Value>[]
        : T extends object
          ? { readonly [Key in keyof T]: ReadOnly<T[Key]> }
          : T;
