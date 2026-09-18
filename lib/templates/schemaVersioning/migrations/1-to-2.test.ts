import { describe, it, expect } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { migrateFrom1To2 } from "./1-to-2";

const baseTemplate = {
  titleEn: "Title",
  titleFr: "Titre",
  layout: [],
  elements: [],
} as unknown as FormProperties;

describe("migrateFrom1To2", () => {
  it("stamps an explicit version 2 without changing anything else", () => {
    const migrated = migrateFrom1To2(baseTemplate);
    expect(migrated).toEqual({ ...baseTemplate, version: 2 });
  });
});
