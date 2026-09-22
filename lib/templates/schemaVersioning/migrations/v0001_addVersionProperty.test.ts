import { describe, it, expect } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { addVersionProperty } from "./v0001_addVersionProperty";

const baseTemplate = {
  titleEn: "Title",
  titleFr: "Titre",
  layout: [],
  elements: [],
} as unknown as FormProperties;

describe("addVersionProperty", () => {
  it("stamps an explicit version 1 without changing anything else", () => {
    const migrated = addVersionProperty(baseTemplate);
    expect(migrated).toEqual({ ...baseTemplate, version: 1 });
  });
});
