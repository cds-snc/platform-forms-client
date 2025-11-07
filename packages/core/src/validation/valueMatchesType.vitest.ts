import { valueMatches } from "./valueMatchesType";
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
    expect(valueMatches("hello", FormElementTypes.textField, baseTextField)).toBe(true);
  });

  it("throws for an empty string", () => {
    expect(() => valueMatches("", FormElementTypes.textField, baseTextField)).toThrow();
  });

  it("throws for a null value", () => {
    expect(() => valueMatches(null, FormElementTypes.fileInput, baseTextField)).toThrow();
  });

  it("returns false for a non-string value", () => {
    expect(valueMatches(123, FormElementTypes.textField, baseTextField)).toBe(false);
    expect(valueMatches({}, FormElementTypes.textField, baseTextField)).toBe(false);
    expect(valueMatches([], FormElementTypes.textField, baseTextField)).toBe(false);
  });

  it("returns false for invalid email if autoComplete is email", () => {
    const emailField: FormElement = {
      ...baseTextField,
      properties: {
        ...baseTextField.properties,
        autoComplete: "email",
      },
    };
    expect(valueMatches("not-an-email", FormElementTypes.textField, emailField)).toBe(false);
  });

  it("returns true for valid email if autoComplete is email", () => {
    const emailField: FormElement = {
      ...baseTextField,
      properties: {
        ...baseTextField.properties,
        autoComplete: "email",
      },
    };
    expect(valueMatches("test@example.com", FormElementTypes.textField, emailField)).toBe(true);
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
    expect(valueMatches(fileObj, FormElementTypes.fileInput, baseFileInput)).toBe(true);
  });

  it("returns false for file object with invalid extension", () => {
    const fileObj = { name: "test.exe", size: 1234, id: "abc" };
    expect(valueMatches(fileObj, FormElementTypes.fileInput, baseFileInput)).toBe(false);
  });

  it("returns false for missing file properties", () => {
    expect(valueMatches({}, FormElementTypes.fileInput, baseFileInput)).toBe(false);
    expect(valueMatches("not a file", FormElementTypes.fileInput, baseFileInput)).toBe(false);
  });


});

describe("valueMatchesType - dynamicRow", () => {
  const payload = [
    {
      "0": "Row 1 text",
      "1": {
        id: "13278d83-70fc-40dd-8953-eec1a403be5b",
        name: "fine.csv",
        size: 1765,
      },
    },
    {
      "0": "Row 2 text",
      "1": {
        id: "b8074de2-c815-4c72-b1d5-c1f8be433aaf",
        name: "bad-extension.mcsv",
        size: 1765,
      },
    }
  ];

  const dynamicRowElement: FormElement = {
    id: 3,
    type: FormElementTypes.dynamicRow,
    properties: {
      titleEn: "Dynamic Row",
      titleFr: "Ligne dynamique",
      subElements: [
        {
          id: 1,
          type: FormElementTypes.textField,
          properties: {
            titleEn: "Text field sub-element",
            titleFr: "Sous-élément de champ de texte",
          },
        },
        {
          id: 2,
          type: FormElementTypes.fileInput,
          properties: {
            titleEn: "File input sub-element",
            titleFr: "Sous-élément de champ de fichier",
          },
        },
      ],
    },
  };

  it("returns array for valid dynamicRow value", () => {
    expect(valueMatches(payload, FormElementTypes.dynamicRow, dynamicRowElement)).toStrictEqual([
      {
        responseKey: 1,
        rowIndex: 1,
        subElementId: 2,
        type: "fileInput",
        value: {
          id: "b8074de2-c815-4c72-b1d5-c1f8be433aaf",
          name: "bad-extension.mcsv",
          size: 1765,
        },
      },
    ]);
  });
});
