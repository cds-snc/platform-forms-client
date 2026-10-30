import { describe, expect, it } from "vitest";
import {
  getDuplicateChoiceIndexes,
  getLocalizedLabel,
  getProblemElement,
  getProblemField,
  isDuplicateChoicesProblem,
} from "./migrationProblemHelpers";

const problem = (path: string, name = "uniqueItems", message = "contains duplicate item") => ({
  path,
  name,
  message,
  fromVersion: 1,
});

describe("migrationProblemHelpers", () => {
  const child = { properties: { titleEn: "Child" } };
  const elements = [
    { properties: { titleEn: "First" } },
    { properties: { titleEn: "Parent", subElements: [{ properties: {} }, child] } },
  ];

  it.each([
    "elements[1].properties.subElements[1].properties.choices",
    "elements.1.properties.subElements.1.properties.choices",
  ])("resolves nested elements from %s", (path) => {
    expect(getProblemElement(elements, path)).toBe(child);
  });

  it("returns undefined for paths outside elements", () => {
    expect(getProblemElement(elements, "titleEn")).toBeUndefined();
    expect(getProblemElement(elements, "elements[5].properties")).toBeUndefined();
  });

  it("reads the missing property for required problems and the last segment otherwise", () => {
    expect(
      getProblemField(problem("elements[0].properties", "required", 'requires property "titleEn"'))
    ).toBe("titleEn");
    expect(getProblemField(problem("elements[0].properties.choices"))).toBe("choices");
  });

  it("detects duplicate choice problems and the duplicated indexes", () => {
    expect(isDuplicateChoicesProblem(problem("elements[0].properties.choices"))).toBe(true);
    expect(isDuplicateChoicesProblem(problem("elements[0].properties.conditionalRules"))).toBe(
      false
    );
    expect(
      getDuplicateChoiceIndexes([
        { en: "a", fr: "a" },
        { en: "b", fr: "b" },
        { fr: "a", en: "a" },
      ])
    ).toEqual([0, 2]);
    expect(getDuplicateChoiceIndexes(undefined)).toEqual([]);
  });

  it("falls back to the other language for labels", () => {
    expect(getLocalizedLabel({ en: "Yes", fr: "Oui" }, "fr")).toBe("Oui");
    expect(getLocalizedLabel({ en: "Yes", fr: "" }, "fr")).toBe("Yes");
    expect(getLocalizedLabel({ fr: "Oui" }, "en")).toBe("Oui");
    expect(getLocalizedLabel("plain", "en")).toBe("plain");
    expect(getLocalizedLabel(undefined, "en")).toBeUndefined();
  });
});
