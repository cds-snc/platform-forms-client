export const isObject = (value: unknown) =>
  Object.prototype.toString.call(value) === "[object Object]";

export interface ObjectMap<T> {
  [k: string]: T;
}
