import { describe, it, expect } from "vitest";

import { validateElement } from "./elementLoader";
import { parseElementJson } from "./elementLoader";

describe("validateElement", () => {
  it("should validate a valid textField element", () => {
    expect(() =>
      validateElement({
        id: 1,
        type: "textField",
        properties: {
          titleEn: "Name",
          titleFr: "Nom",
        },
      })
    ).not.toThrow();
  });

  it("should throw if type is missing", () => {
    expect(() =>
      validateElement({
        id: 1,
        properties: { titleEn: "Name", titleFr: "Nom" },
      })
    ).toThrow("Element type is required");
  });

  it("should throw if type is invalid", () => {
    expect(() =>
      validateElement({
        id: 1,
        type: "notAType",
        properties: { titleEn: "Name", titleFr: "Nom" },
      })
    ).toThrow("Element type is invalid");
  });

  it("should throw if properties are missing", () => {
    expect(() =>
      validateElement({
        id: 1,
        type: "textField",
        properties: undefined,
      })
    ).toThrow("Element properties are required");
  });

  it("should throw if titleEn or titleFr is missing", () => {
    expect(() =>
      validateElement({
        id: 1,
        type: "textField",
        properties: { titleEn: "Name" },
      })
    ).toThrow("Element properties must have titleEn and titleFr");

    expect(() =>
      validateElement({
        id: 1,
        type: "textField",
        properties: { titleFr: "Nom" },
      })
    ).toThrow("Element properties must have titleEn and titleFr");
  });

  it("should validate a valid radio element", () => {
    expect(() =>
      validateElement({
        id: 2,
        type: "radio",
        properties: {
          titleEn: "Choose",
          titleFr: "Choisir",
          choices: [
            { en: "A", fr: "A" },
            { en: "B", fr: "B" },
          ],
        },
      })
    ).not.toThrow();
  });

  it("should throw if radio choices are missing or not an array", () => {
    expect(() =>
      validateElement({
        id: 2,
        type: "radio",
        properties: {
          titleEn: "Choose",
          titleFr: "Choisir",
        },
      })
    ).toThrow("Element of type radio must have a 'choices' array in properties");

    expect(() =>
      validateElement({
        id: 2,
        type: "radio",
        properties: {
          titleEn: "Choose",
          titleFr: "Choisir",
          choices: "not-an-array",
        },
      })
    ).toThrow("Element of type radio must have a 'choices' array in properties");
  });

  it("should throw if a radio choice is missing en or fr", () => {
    expect(() =>
      validateElement({
        id: 2,
        type: "radio",
        properties: {
          titleEn: "Choose",
          titleFr: "Choisir",
          choices: [{ en: "A" }],
        },
      })
    ).toThrow("Choice at index 0 in radio is missing 'en' or 'fr'");
  });
});

describe("parseElementJson", () => {
  it("should parse a valid JSON string into an object", () => {
    const jsonString =
      '{"id":1,"type":"textField","properties":{"titleEn":"Name","titleFr":"Nom"}}';
    const result = parseElementJson(jsonString);
    expect(result).toEqual({
      id: 1,
      type: "textField",
      properties: { titleEn: "Name", titleFr: "Nom" },
    });
  });

  it("should throw if the JSON string is invalid", () => {
    const invalidJsonString =
      '{"id":1,"type":"textField","properties":{"titleEn":"Name","titleFr":"Nom"';
    expect(() => parseElementJson(invalidJsonString)).toThrow("Invalid JSON format");
  });

  it("should throw if the JSON string is empty", () => {
    const emptyJsonString = "";
    expect(() => parseElementJson(emptyJsonString)).toThrow("Invalid JSON format");
  });

  // it should hanlde user pasting a js object
  it("should handle user pasting a JS object", () => {

    const invalidInput = {
      id: 1,
      type: "textField",
      properties: { titleEn: "Name", titleFr: "Nom" },
    };

    const result = parseElementJson(JSON.stringify(invalidInput));

    expect(result).toEqual({
      id: 1,
      type: "textField",
      properties: { titleEn: "Name", titleFr: "Nom" },
    });

  });
});
