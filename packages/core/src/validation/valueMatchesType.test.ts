import { valueMatchesType } from "./valueMatchesType";
import { FormElementTypes, FormElement } from "@gcforms/types";

describe("valueMatchesType - textField", () => {
  const baseTextField: FormElement = {
    id: 1,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Text field",
      titleFr: "Champ de texte",
    },
  };

  it("returns true for a string value", () => {
    expect(valueMatchesType("hello", FormElementTypes.textField, baseTextField)).toBe(true);
  });

  it("returns true for an empty string", () => {
    expect(valueMatchesType("", FormElementTypes.textField, baseTextField)).toBe(true);
  });

  it("returns false for a non-string value", () => {
    expect(valueMatchesType(123, FormElementTypes.textField, baseTextField)).toBe(false);
    expect(valueMatchesType({}, FormElementTypes.textField, baseTextField)).toBe(false);
    expect(valueMatchesType([], FormElementTypes.textField, baseTextField)).toBe(false);
  });

  it("returns false for invalid email if autoComplete is email", () => {
    const emailField: FormElement = {
      ...baseTextField,
      properties: {
        ...baseTextField.properties,
        autoComplete: "email",
      },
    };
    expect(valueMatchesType("not-an-email", FormElementTypes.textField, emailField)).toBe(false);
  });

  it("returns true for valid email if autoComplete is email", () => {
    const emailField: FormElement = {
      ...baseTextField,
      properties: {
        ...baseTextField.properties,
        autoComplete: "email",
      },
    };
    expect(valueMatchesType("test@example.com", FormElementTypes.textField, emailField)).toBe(true);
  });
});

describe("valueMatchesType - fileInput", () => {
  const baseFileInput: FormElement = {
    id: 2,
    type: FormElementTypes.fileInput,
    properties: {
      titleEn: "File input",
      titleFr: "Champ de fichier",
    },
  };

  it("returns true for valid file object", () => {
    const fileObj = { name: "test.pdf", size: 1234, id: "abc" };
    expect(valueMatchesType(fileObj, FormElementTypes.fileInput, baseFileInput)).toBe(true);
  });

  it("returns false for file object with invalid extension", () => {
    const fileObj = { name: "test.exe", size: 1234, id: "abc" };
    expect(valueMatchesType(fileObj, FormElementTypes.fileInput, baseFileInput)).toBe(false);
  });

  it("returns false for missing file properties", () => {
    expect(valueMatchesType({}, FormElementTypes.fileInput, baseFileInput)).toBe(false);
    expect(valueMatchesType(null, FormElementTypes.fileInput, baseFileInput)).toBe(false);
    expect(valueMatchesType("not a file", FormElementTypes.fileInput, baseFileInput)).toBe(false);
  });
});
