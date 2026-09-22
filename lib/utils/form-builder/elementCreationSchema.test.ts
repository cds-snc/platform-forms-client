import { describe, it, expect } from "vitest";
import { v4 as uuid } from "uuid";
import { validateTemplate } from "./validate";
import { createElement, defaultField } from "./itemHelper";
import { FormElementTypes, type FormElement, type FormProperties } from "@gcforms/types";
import { CURRENT_TEMPLATE_VERSION } from "@lib/templates/schemaVersioning/migrations";
import { MAX_DYNAMIC_ROW_AMOUNT } from "@root/constants";

// Mirrors the "type" values passed to createElement() by useHandleAdd.tsx for
// each real, persistable FormElementTypes (excludes UI-only template/picker
// ids like "firstMiddleLastName"/"contact"/"customJson" that expand into
// other real elements before insertion, and "attestation" which createElement
// maps onto the checkbox type).
const creationTypes: string[] = [
  "textField",
  "textArea",
  FormElementTypes.dropdown,
  FormElementTypes.radio,
  FormElementTypes.checkbox,
  FormElementTypes.fileInput,
  FormElementTypes.dynamicRow,
  FormElementTypes.richText,
  FormElementTypes.attestation,
  FormElementTypes.combobox,
  FormElementTypes.addressComplete,
  FormElementTypes.formattedDate,
  "number",
  FormElementTypes.starRating,
];

const createDefaults = () => ({
  ...defaultField,
  uuid: uuid(),
  properties: { ...defaultField.properties, validation: { required: false } },
});

// Replicates the small amount of post-creation setup useHandleAdd.tsx does
// for element types that need it, so this test reflects what's actually
// persisted, not just what createElement() alone returns.
const finishCreation = (element: FormElement): FormElement => {
  if (element.type === FormElementTypes.fileInput) {
    element.properties.fileType = ["pdf"];
  } else if (element.type === FormElementTypes.dynamicRow) {
    element.properties.dynamicRow = {
      rowTitleEn: "",
      rowTitleFr: "",
      addButtonTextEn: "",
      removeButtonTextEn: "",
      addButtonTextFr: "",
      removeButtonTextFr: "",
    };
    element.properties.maxNumberOfRows = MAX_DYNAMIC_ROW_AMOUNT;
  }
  return element;
};

const baseTemplate: FormProperties = {
  version: CURRENT_TEMPLATE_VERSION,
  titleEn: "Title",
  titleFr: "Titre",
  privacyPolicy: {},
  confirmation: {},
  layout: [],
  elements: [],
};

describe("newly created elements satisfy the strict (version >= 3) schema", () => {
  it.each(creationTypes)("type %s", (type) => {
    let id = 1;
    let item = createElement(createDefaults(), type) as FormElement;
    item.id = id;
    item = finishCreation(item);

    const template: FormProperties = {
      ...baseTemplate,
      layout: [id],
      elements: [item],
    };

    const result = validateTemplate(template);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
