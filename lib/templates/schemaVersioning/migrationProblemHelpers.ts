import isEqual from "lodash.isequal";
import { type TemplateMigrationProblem } from "./getTemplateMigrationProblems";

export type ProblemElement = {
  properties?: {
    titleEn?: string;
    titleFr?: string;
    choices?: unknown[];
    subElements?: ProblemElement[];
  };
};

type Localized = { en?: unknown; fr?: unknown };

/** Resolves the (sub)element a problem path such as `elements[0].properties.subElements.1` points to. */
export const getProblemElement = <T extends ProblemElement>(
  elements: readonly T[],
  path: string
): T | undefined => {
  const index = path.match(/^elements(?:\[(\d+)\]|\.(\d+))/);
  if (!index) return undefined;
  let element: ProblemElement | undefined = elements[Number(index[1] ?? index[2])];
  for (const match of path.matchAll(/\.properties\.subElements(?:\[(\d+)\]|\.(\d+))/g)) {
    element = element?.properties?.subElements?.[Number(match[1] ?? match[2])];
  }
  return element as T | undefined;
};

/** The property a problem refers to: the missing property for `required`, otherwise the last path segment. */
export const getProblemField = (problem: TemplateMigrationProblem): string | undefined =>
  (problem.name === "required"
    ? problem.message.match(/requires property ["']([^"']+)["']/)?.[1]
    : undefined) ?? problem.path.split(".").at(-1);

export const isDuplicateChoicesProblem = (problem: TemplateMigrationProblem) =>
  problem.name === "uniqueItems" && problem.path.endsWith(".choices");

/** Indexes of every choice that is deep-equal to at least one other choice. */
export const getDuplicateChoiceIndexes = (choices: unknown[] | undefined): number[] =>
  (choices ?? []).flatMap((choice, index, all) =>
    all.some((other, otherIndex) => otherIndex !== index && isEqual(choice, other)) ? [index] : []
  );

/** Picks the value for `language`, falling back to the other language. */
export const getLocalizedLabel = (value: unknown, language: string): string | undefined => {
  if (typeof value !== "object" || value === null) {
    return typeof value === "string" && value ? value : undefined;
  }
  const { en, fr } = value as Localized;
  const [primary, fallback] = language === "fr" ? [fr, en] : [en, fr];
  return [primary, fallback].find((label): label is string => typeof label === "string" && !!label);
};
