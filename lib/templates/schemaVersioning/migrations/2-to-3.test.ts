import { describe, it, expect } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { migrateFrom2To3 } from "./2-to-3";

const baseTemplate = {
  titleEn: "Title",
  titleFr: "Titre",
  layout: [],
  elements: [],
  version: 2,
} as unknown as FormProperties;

describe("migrateFrom2To3", () => {
  it("stamps an explicit version 3 without changing anything else", () => {
    const migrated = migrateFrom2To3(baseTemplate);
    expect(migrated).toEqual({ ...baseTemplate, version: 3 });
  });
});
