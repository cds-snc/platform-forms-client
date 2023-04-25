import { FormElement } from "@lib/types";
import { defaultField, setDescription, setTitle, updateElement } from "./itemHelper";

let defaultElement = { ...defaultField };

describe("Set localized Item properties", () => {
  it("sets description en", () => {
    const item = setDescription(defaultField, "en", "desc en");
    expect(item.properties.descriptionEn).toEqual("desc en");
  });

  it("sets description fr", () => {
    const item = setDescription(defaultField, "fr", "desc fr");
    expect(item.properties.descriptionFr).toEqual("desc fr");
  });

  it("sets title en", () => {
    const item = setTitle(defaultField, "en", "title en");
    expect(item.properties.titleEn).toEqual("title en");
  });

  it("sets title fr", () => {
    const item = setTitle(defaultField, "fr", "title fr");
    expect(item.properties.titleFr).toEqual("title fr");
  });
});

describe("Update elements", () => {
  beforeEach(() => {
    defaultElement = { ...defaultField } as FormElement;
  });

  it("sets properties for phone", () => {
    const item = updateElement(defaultElement, "phone");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("phone");
    expect(item.properties.autoComplete).toEqual("phone");
  });

  it("sets properties for email", () => {
    const item = updateElement(defaultElement, "email");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("email");
    expect(item.properties.autoComplete).toEqual("email");
  });

  it("sets properties for date field", () => {
    const item = updateElement(defaultElement, "date");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("date");
  });

  it("sets properties for number", () => {
    const item = updateElement(defaultElement, "number");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("number");
  });

  it("sets properties for attestation", () => {
    const item = updateElement(defaultElement, "attestation");
    expect(item.type).toEqual("checkbox");
    expect(item.properties.validation?.all).toEqual(true);
    expect(item.properties.validation?.required).toEqual(true);
  });

  it("sets properties for richText", () => {
    const item = updateElement(defaultElement, "richText");
    expect(item.type).toEqual("richText");
  });
});
