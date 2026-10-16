import { describe, it, expect } from "vitest";
import { FormElement, FormElementTypes } from "@lib/types";
import { type TemplateStoreState } from "@lib/store/types";
import { addSubItem } from "@lib/store/helpers/add/addSubItem";
import {
  setDescription,
  setTitle,
  createElement,
  filterElementPropertiesByType,
} from "../itemHelper";

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
    expect(item).toEqual({
      ...getItem(),
      type: "richText",
      properties: { descriptionEn: "", descriptionFr: "" },
    });
  });

  it("sets properties for radio", () => {
    const item = createElement(getItem(), "radio");
    expect(item.properties).toEqual({
      choices: [{ en: "", fr: "" }],
      titleEn: "",
      titleFr: "",
      validation: { required: false },
      descriptionEn: "",
      descriptionFr: "",
    });
  });

  it("sets properties for checkbox", () => {
    const item = createElement(getItem(), "checkbox");
    expect(item.properties).toEqual({
      choices: [{ en: "", fr: "" }],
      titleEn: "",
      titleFr: "",
      validation: { required: false },
      descriptionEn: "",
      descriptionFr: "",
    });
  });

  it("sets properties for dropdown", () => {
    const item = createElement(getItem(), "dropdown");
    expect(item.properties).toEqual({
      choices: [{ en: "", fr: "" }],
      titleEn: "",
      titleFr: "",
      validation: { required: false },
      descriptionEn: "",
      descriptionFr: "",
    });
  });

  it("sets properties for textArea", () => {
    const item = createElement(getItem(), "textArea");
    expect(item.properties).toEqual({
      titleEn: "",
      titleFr: "",
      validation: { required: false },
      descriptionEn: "",
      descriptionFr: "",
      placeholderEn: "",
      placeholderFr: "",
    });
  });

  it("sets properties for textField", () => {
    const item = createElement(getItem(), "textField");
    expect(item.properties).toEqual({
      titleEn: "",
      titleFr: "",
      validation: { required: false },
      descriptionEn: "",
      descriptionFr: "",
      placeholderEn: "",
      placeholderFr: "",
    });
  });

  it("cleans generic defaults when adding a sub-element", async () => {
    const state = {
      form: {
        elements: [
          {
            id: 1,
            type: FormElementTypes.dynamicRow,
            properties: { subElements: [] },
          },
        ],
      },
    } as unknown as TemplateStoreState;
    const set = (update: (state: TemplateStoreState) => void) => update(state);

    await addSubItem(set)(1, 0, FormElementTypes.richText, {
      ...getItem(),
      type: FormElementTypes.richText,
    });

    expect(state.form.elements[0].properties.subElements?.[0].properties).toEqual({
      descriptionEn: "",
      descriptionFr: "",
    });
  });
});

describe("Clean element properties", () => {
  const allowedPropertiesByType: Partial<Record<FormElementTypes, string[]>> = {
    [FormElementTypes.textField]: [
      "questionId", "tags", "titleEn", "titleFr", "placeholderEn", "placeholderFr",
      "descriptionEn", "descriptionFr", "conditionalRules", "validation", "autoComplete",
    ],
    [FormElementTypes.textArea]: [
      "questionId", "tags", "titleEn", "titleFr", "placeholderEn", "placeholderFr",
      "descriptionEn", "descriptionFr", "conditionalRules", "validation",
    ],
    [FormElementTypes.numberInput]: [
      "questionId", "tags", "titleEn", "titleFr", "placeholderEn", "placeholderFr",
      "descriptionEn", "descriptionFr", "conditionalRules", "validation",
      "allowNegativeNumbers", "stepCount", "currencyCode", "useThousandsSeparator",
    ],
    [FormElementTypes.dropdown]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "choices", "sortOrder",
    ],
    [FormElementTypes.radio]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "choices",
    ],
    [FormElementTypes.checkbox]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "choices",
    ],
    [FormElementTypes.combobox]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "choices", "managedChoices", "strictValue",
    ],
    [FormElementTypes.fileInput]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "fileType",
    ],
    [FormElementTypes.dynamicRow]: [
      "titleEn", "titleFr", "descriptionEn", "descriptionFr", "conditionalRules",
      "validation", "maxNumberOfRows", "dynamicRow", "subElements",
    ],
    [FormElementTypes.richText]: ["descriptionEn", "descriptionFr", "conditionalRules"],
    [FormElementTypes.attestation]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation",
    ],
    [FormElementTypes.addressComplete]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "addressComponents",
    ],
    [FormElementTypes.formattedDate]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "dateFormat", "autoComplete",
    ],
    [FormElementTypes.starRating]: [
      "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
      "conditionalRules", "validation", "numberOfStars",
    ],
  };

  it.each(Object.values(FormElementTypes))(
    "handles all properties for element type %s",
    (type) => {
      const properties = Object.fromEntries(
        [
          "questionId", "tags", "titleEn", "titleFr", "descriptionEn", "descriptionFr",
          "conditionalRules", "validation", "placeholderEn", "placeholderFr", "choices",
          "sortOrder", "managedChoices", "strictValue", "fileType", "maxNumberOfRows",
          "dynamicRow", "subElements", "autoComplete", "allowNegativeNumbers", "stepCount",
          "currencyCode", "useThousandsSeparator", "addressComponents", "dateFormat",
          "numberOfStars", "unsupportedProperty",
        ].map((property) => [property, true])
      );
      const element = { id: 1, type, properties } as unknown as FormElement;
      const allowedProperties = allowedPropertiesByType[type];

      const cleanedElement = filterElementPropertiesByType(element);

      if (!allowedProperties) {
        expect(cleanedElement).toBe(element);
        return;
      }

      expect(Object.keys(cleanedElement.properties).sort()).toEqual(
        [...allowedProperties].sort()
      );
    }
  );
});
