import { FormElement, FormElementTypes } from "@gcforms/types";
import { MAX_FILE_SIZE } from "./file";
import { isFieldResponseValid } from "./validation";

describe("structured field validation", () => {
  const text: FormElement = {
    id: 1,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Text",
      titleFr: "Texte",
      validation: { required: true, type: "email", maxLength: 2 },
    },
  };

  it("preserves required and regex precedence over configured length limits", () => {
    expect(isFieldResponseValid("", text)).toEqual({ code: "required" });
    expect(isFieldResponseValid("invalid", text)).toEqual({ code: "invalid-email" });
    expect(isFieldResponseValid("a@b.ca", text)).toEqual({ code: "max-length", count: 4 });
  });

  it("returns hard-limit overflow counts before other validation", () => {
    expect(isFieldResponseValid("x".repeat(10002), text)).toEqual({
      code: "input-too-long",
      count: 2,
    });
  });

  it("distinguishes unsafe custom patterns from pattern mismatches", () => {
    const custom: FormElement = {
      ...text,
      properties: {
        ...text.properties,
        validation: { required: false, type: "custom", regex: "^(a+)+$" },
      },
    };
    expect(isFieldResponseValid("b", custom)).toEqual({ code: "unsafe-regex" });
    custom.properties.validation = { required: false, type: "custom", regex: "^a+$" };
    expect(isFieldResponseValid("b", custom)).toEqual({ code: "pattern-mismatch" });
    expect(isFieldResponseValid("a", custom)).toBeNull();
  });

  it("preserves extension-before-size precedence and includes the size limit", () => {
    const file: FormElement = {
      id: 2,
      type: FormElementTypes.fileInput,
      properties: { titleEn: "File", titleFr: "Fichier", validation: { required: true } },
    };
    expect(isFieldResponseValid({ name: "test.exe", size: MAX_FILE_SIZE + 1 }, file)).toEqual({
      code: "invalid-file-type",
    });
    expect(isFieldResponseValid({ name: "test.pdf", size: MAX_FILE_SIZE + 1 }, file)).toEqual({
      code: "file-too-large",
      maxSizeInMb: 10,
    });
    expect(isFieldResponseValid({ name: "test.pdf", size: MAX_FILE_SIZE }, file)).toBeNull();
  });

  it("returns null for all-valid repeating rows", () => {
    const repeating: FormElement = {
      id: 3,
      type: FormElementTypes.dynamicRow,
      properties: {
        titleEn: "Rows",
        titleFr: "Lignes",
        validation: { required: false },
        subElements: [
          {
            ...text,
            properties: { ...text.properties, validation: { required: true } },
          },
        ],
      },
    };
    expect(isFieldResponseValid([{ 0: "" }], repeating)).toEqual([{ 0: { code: "required" } }]);
    expect(isFieldResponseValid([{ 0: "valid" }, { 0: "valid" }], repeating)).toBeNull();
  });
});
