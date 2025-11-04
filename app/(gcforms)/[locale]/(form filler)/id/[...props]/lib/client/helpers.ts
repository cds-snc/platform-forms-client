import { LOCKED_GROUPS } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/right-panel/headless-treeview/constants";

type JsonPrimitive = string | number | boolean | null;

// Flattens a nested structure into an array of strings and file objects
export const flattenStructureToValues = (root: unknown): JsonPrimitive[] => {
  const out: JsonPrimitive[] = [];
  const visit = (node: unknown): void => {
    if (
      node === null || // Guards against reaching below if object e.g. File placeholder uses null for some values
      typeof node === "string"
    ) {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node === "object") {
      for (const value of Object.values(node as Record<string, unknown>)) {
        visit(value);
      }
    }
  };
  visit(root);
  return out;
};

const NON_VALUE_FORM_ELEMENTS = new Set([
  ...Object.values(LOCKED_GROUPS),
  "currentGroup",
  "groupHistory",
  "matchedIds",
]);

// Removes non-value keys from a form values object
export const stripExcludedKeys = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!NON_VALUE_FORM_ELEMENTS.has(k)) {
      out[k as keyof T] = v as T[keyof T];
    }
  }
  return out;
};
