import { FormElement } from "@lib/types";
import { setDescription, setTitle, updateElement } from "./itemHelper";

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
    const item = updateElement(getItem(), "phone");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("phone");
    expect(item.properties.autoComplete).toEqual("phone");
  });

  it("sets properties for email", () => {
    const item = updateElement(getItem(), "email");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("email");
    expect(item.properties.autoComplete).toEqual("email");
  });

  it("sets properties for date field", () => {
    const item = updateElement(getItem(), "date");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("date");
  });

  it("sets properties for number", () => {
    const item = updateElement(getItem(), "number");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("number");
  });

  it("sets properties for attestation", () => {
    const item = updateElement(getItem(), "attestation");
    expect(item.type).toEqual("checkbox");
    expect(item.properties.validation?.all).toEqual(true);
    expect(item.properties.validation?.required).toEqual(true);
  });

  it("sets properties for richText", () => {
    const item = updateElement(getItem(), "richText");
    expect(item).toEqual({ ...getItem(), type: "richText" });
  });

  it("sets properties for radio", () => {
    const item = updateElement(getItem(), "radio");
    expect(item).toEqual({ ...getItem(), type: "radio" });
  });

  it("sets properties for checkbox", () => {
    const item = updateElement(getItem(), "checkbox");
    expect(item).toEqual({ ...getItem(), type: "checkbox" });
  });

  it("sets properties for dropdown", () => {
    const item = updateElement(getItem(), "dropdown");
    expect(item).toEqual({ ...getItem(), type: "dropdown" });
  });

  it("sets properties for textArea", () => {
    const item = updateElement(getItem(), "textArea");
    expect(item).toEqual({ ...getItem(), type: "textArea" });
  });

  it("sets properties for textField", () => {
    const item = updateElement(getItem(), "textField");
    expect(item).toEqual({ ...getItem(), type: "textField" });
  });
});
