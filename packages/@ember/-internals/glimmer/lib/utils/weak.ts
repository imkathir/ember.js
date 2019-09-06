import { Dict } from '@glimmer/interfaces';
import { dict } from '@glimmer/util';

const REFS = new WeakMap<object, WeakRef>();
const VALS = new WeakMap<WeakRef, object>();

export class WeakRef<T extends object = object> {
  static for<T extends object>(value: T | WeakRef<T>): WeakRef<T> {
    if (value instanceof WeakRef) {
      return value;
    }

    let ref = REFS.get(value) as WeakRef<T> | undefined;

    if (ref === undefined) {
      ref = new WeakRef();
      VALS.set(ref, value);
      REFS.set(value, ref);
    }

    return ref;
  }

  static willDestroy<T extends object>(value: T | WeakRef<T>): void {
    let ref = WeakRef.for(value);
    let val = VALS.get(ref);

    VALS.delete(ref);

    if (val !== undefined) {
      REFS.delete(val);
    }
  }

  private constructor() {}

  get(): T | undefined {
    return VALS.get(this) as T | undefined;
  }

}

const SETS = new WeakMap<object, Dict<WeakRefSet>>();

export class WeakRefSet<T extends object = object> implements Iterable<T> {
  static for<T extends object>(parent: object, purpose: string): WeakRefSet<T> {
    let map = SETS.get(parent) as Dict<WeakRefSet<T>> | undefined;

    if (map === undefined) {
      map = dict();
      SETS.set(parent, map);
    }

    let set = map[purpose] as WeakRefSet<T> | undefined;

    if (set === undefined) {
      set = new WeakRefSet();
      map[purpose] = set;
    }

    return set;
  }

  private refs = new Set();

  add(value: T | WeakRef<T>): WeakRef<T> {
    let ref = WeakRef.for(value);
    this.refs.add(ref);
    return ref;
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let ref of this.refs) {
      let value = ref.get();

      if (value === undefined) {
        this.refs.delete(ref);
      } else {
        yield value;
      }
    }
  }
}
