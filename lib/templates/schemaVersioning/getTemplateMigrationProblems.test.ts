import { describe, expect, it } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { getTemplateMigrationProblems } from "./getTemplateMigrationProblems";

const form = (schemaVersion: number, elements: unknown[]): FormProperties =>
  ({ schemaVersion, elements, layout: [] }) as unknown as FormProperties;

const dropdown = (choices: { en: string; fr: string }[]) => ({
  id: 8,
  type: "dropdown",
  properties: {
    titleEn: "Select a province",
    titleFr: "Choisissez une province",
    validation: { required: false },
    choices,
  },
});

describe("getTemplateMigrationProblems", () => {
  it("reports structured validation issues without modifying the draft", () => {
    const choices = [
      { en: "Ontario", fr: "Ontario" },
      { en: "Ontario", fr: "Ontario" },
    ];
    const template = form(1, [dropdown(choices)]);
    const original = structuredClone(template);

    expect(getTemplateMigrationProblems(template)).toContainEqual(
      expect.objectContaining({
        path: "elements[0].properties.choices",
        name: "uniqueItems",
        fromVersion: 1,
      })
    );
    expect(template).toEqual(original);
    expect(getTemplateMigrationProblems(form(1, [dropdown([choices[0]])]))).toEqual([]);
  });

  it("checks forms that need more than one upgrade and ignores current versions", () => {
    const duplicate = { en: "Ontario", fr: "Ontario" };
    const legacy = form(0, [dropdown([duplicate, duplicate])]);
    delete legacy.schemaVersion;
    expect(getTemplateMigrationProblems(legacy)).toContainEqual(
      expect.objectContaining({ name: "uniqueItems", fromVersion: 1 })
    );
    expect(getTemplateMigrationProblems(form(2, [dropdown([duplicate, duplicate])]))).toEqual([]);
  });

  it("reports failures before validation, including unsupported elements", () => {
    expect(
      getTemplateMigrationProblems(form(1, [{ id: 1, type: "customJson", properties: {} }]))
    ).toEqual([expect.objectContaining({ name: "migration", path: "elements.0", fromVersion: 1 })]);
  });
});
