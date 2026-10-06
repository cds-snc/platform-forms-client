import { describe, it, expect } from "vitest";
import { Validator } from "jsonschema";
import { FormElement } from "@lib/types";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { setDescription, setTitle, createElement } from "../itemHelper";

function getItem() {
  return {
    id: 0,
    type: "textField",
    properties: {
      subElements: [],
      choices: [{ en: "", fr: "" }],
      titleEn: "",
      titleFr: "",
      validation: {
        required: false,
      },
      descriptionEn: "",
      descriptionFr: "",
      placeholderEn: "",
      placeholderFr: "",
    },
  } as FormElement;
}

describe("Set localized Item properties", () => {
  it("sets description en", () => {
    const item = setDescription(getItem(), "en", "desc en");
    expect(item.properties.descriptionEn).toEqual("desc en");
  });

  it("sets description fr", () => {
    const item = setDescription(getItem(), "fr", "desc fr");
    expect(item.properties.descriptionFr).toEqual("desc fr");
  });

  it("sets title en", () => {
    const item = setTitle(getItem(), "en", "title en");
    expect(item.properties.titleEn).toEqual("title en");
  });

  it("sets title fr", () => {
    const item = setTitle(getItem(), "fr", "title fr");
    expect(item.properties.titleFr).toEqual("title fr");
  });
});

describe("Update elements", () => {
  it("sets properties for phone", () => {
    const item = createElement(getItem(), "tel");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("tel");
    expect(item.properties.autoComplete).toEqual("tel");
  });

  it("sets properties for email", () => {
    const item = createElement(getItem(), "email");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("email");
    expect(item.properties.autoComplete).toEqual("email");
  });

  it("sets properties for date field", () => {
    const item = createElement(getItem(), "date");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("date");
  });

  it("sets properties for number", () => {
    const item = createElement(getItem(), "number");
    expect(item.type).toEqual("numberInput");
    expect(item.properties.validation?.required).toEqual(false);
  });

  it("sets properties for attestation", () => {
    const item = createElement(getItem(), "attestation");
    expect(item.type).toEqual("checkbox");
    expect(item.properties.validation?.all).toEqual(true);
    expect(item.properties.validation?.required).toEqual(true);
  });

  it("sets properties for richText", () => {
    const item = createElement(getItem(), "richText");
    expect(item.type).toEqual("richText");
    expect(item.properties).toEqual({ descriptionEn: "", descriptionFr: "" });
  });

  it("sets properties for radio", () => {
    const item = createElement(getItem(), "radio");
    expect(item.type).toEqual("radio");
    expect(item.properties.choices).toEqual([{ en: "", fr: "" }]);
  });

  it("sets properties for checkbox", () => {
    const item = createElement(getItem(), "checkbox");
    expect(item.type).toEqual("checkbox");
    expect(item.properties.choices).toEqual([{ en: "", fr: "" }]);
  });

  it("sets properties for dropdown", () => {
    const item = createElement(getItem(), "dropdown");
    expect(item.type).toEqual("dropdown");
    expect(item.properties.choices).toEqual([{ en: "", fr: "" }]);
  });

  it("sets properties for textArea", () => {
    const item = createElement(getItem(), "textArea");
    expect(item.type).toEqual("textArea");
    expect(item.properties.choices).toBeUndefined();
    expect(item.properties.validation?.required).toBe(false);
  });

  it("sets properties for textField", () => {
    const item = createElement(getItem(), "textField");
    expect(item.type).toEqual("textField");
    expect(item.properties.choices).toBeUndefined();
    expect(item.properties.validation?.required).toBe(false);
  });

  it.each([
    "textField",
    "textArea",
    "number",
    "dropdown",
    "radio",
    "checkbox",
    "combobox",
    "fileInput",
    "dynamicRow",
    "richText",
    "attestation",
    "addressComplete",
    "formattedDate",
    "starRating",
    "email",
    "tel",
    "date",
    "phone",
  ])("creates a strict-schema-valid %s element", (type) => {
    const validator = new Validator();
    const item = createElement({ ...getItem(), id: 1 }, type);
    const result = validator.validate(
      {
        schemaVersion: 2,
        titleEn: "Title",
        titleFr: "Titre",
        privacyPolicy: {},
        confirmation: {},
        layout: [1],
        groups: {},
        groupsLayout: [],
        elements: [item],
      },
      templatesSchema
    );

    expect(result.valid, JSON.stringify(result.errors)).toBe(true);
  });
});
