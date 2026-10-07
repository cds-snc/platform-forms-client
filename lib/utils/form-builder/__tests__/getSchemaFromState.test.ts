import { describe, it, expect } from "vitest";
import { getSchemaFromState } from "../index";
import { type TemplateStoreState } from "@lib/store/types";

const baseState = {
  form: {
    schemaVersion: 2,
    titleEn: "Title",
    titleFr: "Titre",
    layout: [],
    elements: [],
  },
} as unknown as TemplateStoreState;

describe("getSchemaFromState", () => {
  it("includes the template version in the exported schema", () => {
    const schema = getSchemaFromState(baseState);
    expect(schema.schemaVersion).toBe(2);
  });
});
