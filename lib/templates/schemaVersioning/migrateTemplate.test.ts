import { describe, it, expect } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { getTemplateSchemaVersion, migrateTemplate } from "./migrateTemplate";
import { CURRENT_TEMPLATE_VERSION } from "./migrations";

const baseTemplate = {
  titleEn: "Title",
  titleFr: "Titre",
  layout: [],
  elements: [],
} as unknown as FormProperties;

describe("getTemplateSchemaVersion", () => {
  it("treats a missing version as version 0", () => {
    expect(getTemplateSchemaVersion(baseTemplate)).toBe(0);
  });

  it("returns the explicit version when present", () => {
    expect(getTemplateSchemaVersion({ ...baseTemplate, schemaVersion: 3 })).toBe(3);
  });
});

describe("migrateTemplate", () => {
  it("migrates a template with no version to the current version via the real migration chain", () => {
    const migrated = migrateTemplate(baseTemplate);
    expect(migrated.schemaVersion).toBe(CURRENT_TEMPLATE_VERSION);
    expect(migrated.schemaVersion).toBe(2);
  });

  it("removes null stepCount from numeric elements and repeating-set children without mutating the source", () => {
    const template = {
      ...baseTemplate,
      schemaVersion: 1,
      elements: [
        { id: 1, type: "numberInput", properties: { stepCount: null } },
        {
          id: 2,
          type: "textField",
          properties: { stepCount: null, validation: { type: "number", required: false } },
        },
        {
          id: 3,
          type: "dynamicRow",
          properties: {
            subElements: [
              { id: 301, type: "numberInput", properties: { stepCount: null } },
              {
                id: 302,
                type: "textField",
                properties: { stepCount: null, validation: { type: "number", required: false } },
              },
            ],
          },
        },
      ],
    } as unknown as FormProperties;
    const original = structuredClone(template);

    const migrated = migrateTemplate(template);

    expect(migrated.elements[0].properties).not.toHaveProperty("stepCount");
    expect(migrated.elements[1].properties).not.toHaveProperty("stepCount");
    const children = migrated.elements[2].properties.subElements!;
    expect(children[0].properties).not.toHaveProperty("stepCount");
    expect(children[1].properties).not.toHaveProperty("stepCount");
    expect(migrated.schemaVersion).toBe(2);
    expect(template).toEqual(original);
    expect(migrateTemplate(migrated)).toEqual(migrated);
  });

  it("preserves numeric stepCount, absent values, and unrelated element properties", () => {
    const template = {
      ...baseTemplate,
      schemaVersion: 1,
      elements: [
        { id: 1, type: "numberInput", properties: { stepCount: 0 } },
        { id: 2, type: "numberInput", properties: { stepCount: 2 } },
        { id: 3, type: "numberInput", properties: {} },
        { id: 4, type: "textField", properties: { stepCount: null } },
      ],
    } as unknown as FormProperties;

    expect(migrateTemplate(template)).toEqual({ ...template, schemaVersion: 2 });
  });

  it("is a no-op (aside from stamping) when already at the target version", () => {
    const template = { ...baseTemplate, schemaVersion: CURRENT_TEMPLATE_VERSION };
    const migrated = migrateTemplate(template);
    expect(migrated).toEqual(template);
  });

  it("applies registered migrations in sequence up to the target version", () => {
    const template = { ...baseTemplate, schemaVersion: 1 };
    const migrated = migrateTemplate(template, {
      targetVersion: 3,
      migrations: {
        2: (template) => ({ ...template, schemaVersion: 2, titleEn: "migrated-to-2" }),
        3: (template) => ({ ...template, schemaVersion: 3, titleEn: "migrated-to-3" }),
      },
    });

    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.titleEn).toBe("migrated-to-3");
  });

  it("throws if no migration is registered for the template's version", () => {
    expect(() => migrateTemplate(baseTemplate, { targetVersion: 2, migrations: {} })).toThrow(
      /No migration registered/
    );
  });

  it("throws if a migration does not advance the version", () => {
    expect(() =>
      migrateTemplate(baseTemplate, {
        targetVersion: 2,
        migrations: { 1: (template) => ({ ...template }) },
      })
    ).toThrow(/did not advance/);
  });
});
