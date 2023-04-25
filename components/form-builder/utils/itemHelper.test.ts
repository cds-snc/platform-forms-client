import { defaultField, setDescription, setTitle, updateTextElement } from "./itemHelper";

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

describe("Update text elements", () => {
  it("sets properties for phone", () => {
    //
  });

  it("sets properties for email", () => {
    //
  });

  it("sets properties for date field", () => {
    const item = updateTextElement(defaultField, "date");
    expect(item.type).toEqual("textField");
    expect(item.properties.validation?.type).toEqual("date");
  });

  it("sets properties for number", () => {
    //
  });

  it("sets properties for attestation", () => {
    // ??
  });
});
