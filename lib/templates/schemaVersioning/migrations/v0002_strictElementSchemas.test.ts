import { describe, expect, it } from "vitest";
import { type FormProperties } from "@gcforms/types";
import { getTemplateSchema } from "@lib/templates/schemas/templates";
import { Validator } from "jsonschema";
import validFormTemplate from "../../../../__fixtures__/validFormTemplate.json";
import { migrateToStrictElementSchemas } from "./v0002_strictElementSchemas";

const dynamicRowProperties = {
  validation: { required: false },
  dynamicRow: {
    rowTitleEn: "Row",
    rowTitleFr: "Ligne",
    addButtonTextEn: "Add",
    addButtonTextFr: "Ajouter",
    removeButtonTextEn: "Remove",
    removeButtonTextFr: "Supprimer",
  },
  subElements: [
    {
      id: 2,
      type: "textField",
      properties: {
        titleEn: "Name",
        titleFr: "Nom",
        validation: { required: false },
        conditionalRules: [{ choiceId: "1.0" }],
        legacyProperty: "remove",
      },
    },
  ],
};

const migrate = (elements: unknown[]) =>
  migrateToStrictElementSchemas({
    schemaVersion: 1,
    titleEn: "Title",
    titleFr: "Titre",
    layout: [],
    elements,
  } as unknown as FormProperties);

describe("migrateToStrictElementSchemas", () => {
  it("migrates the representative valid form fixture", () => {
    const migrated = migrate(validFormTemplate.elements);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.elements.find(({ id }) => id === 22)?.properties.dynamicRow).toEqual({
      rowTitleEn: "Entry",
      rowTitleFr: "Entrée",
      addButtonTextEn: "Add",
      addButtonTextFr: "Ajouter",
      removeButtonTextEn: "Remove",
      removeButtonTextFr: "Supprimer",
    });
  });

  it("cleans known element types recursively and converts the legacy number field", () => {
    const migrated = migrate([
      {
        id: 1,
        type: "textField",
        properties: {
          titleEn: "Amount",
          titleFr: "Montant",
          validation: { required: false, type: "number", maxLength: 10 },
          autoComplete: "number",
          legacyProperty: "remove",
        },
      },
      {
        id: 3,
        type: "dynamicRow",
        properties: { ...dynamicRowProperties, legacyProperty: "remove" },
      },
    ]);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.elements[0]).toMatchObject({
      id: 1,
      type: "numberInput",
      properties: {
        titleEn: "Amount",
        titleFr: "Montant",
        validation: { required: false },
      },
    });
    expect(migrated.elements[0].properties).not.toHaveProperty("autoComplete");
    expect(migrated.elements[0].properties).not.toHaveProperty("legacyProperty");
    expect(migrated.elements[1].properties.subElements?.[0].properties).not.toHaveProperty(
      "conditionalRules"
    );
    expect(migrated.elements[1].properties.subElements?.[0].properties).not.toHaveProperty(
      "legacyProperty"
    );
    expect(
      new Validator().validate(migrated.elements, {
        type: "array",
        items: { $ref: "#/definitions/elementStrict" },
        definitions: getTemplateSchema(2).definitions,
      }).valid
    ).toBe(true);
  });

  it("rejects element types that are not supported by schema version 2", () => {
    expect(() =>
      migrate([
        {
          id: 1,
          type: "customJson",
          properties: {},
        },
      ])
    ).toThrow('Cannot migrate unsupported element type "customJson" at elements.0');
  });

  it("does not stamp version 2 when a required strict property is missing", () => {
    expect(() =>
      migrate([
        {
          id: 1,
          type: "dropdown",
          properties: { validation: { required: false } },
        },
      ])
    ).toThrow(/Cannot migrate template elements to schema version 2/);
  });
});
