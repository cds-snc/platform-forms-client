/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import { parseChoiceOptionsCsv, stringifyChoiceOptionsCsv } from "./ChoiceOptionsCsvUpload";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

describe("parseChoiceOptionsCsv", () => {
  it("parses csv rows and skips an en,fr header", () => {
    expect(parseChoiceOptionsCsv("en,fr\nFirst,Premier\nSecond,Deuxieme")).toEqual([
      { en: "First", fr: "Premier" },
      { en: "Second", fr: "Deuxieme" },
    ]);
  });

  it("supports quoted values with commas", () => {
    expect(parseChoiceOptionsCsv('"First, option","Premiere, option"')).toEqual([
      { en: "First, option", fr: "Premiere, option" },
    ]);
  });

  it("throws when a row is missing english or french values", () => {
    expect(() => parseChoiceOptionsCsv("Only English,")).toThrow("invalid-columns");
  });

  it("throws when the csv exceeds the maximum number of choices", () => {
    const rows = Array.from(
      { length: MAX_CHOICE_AMOUNT + 1 },
      (_, index) => `English ${index},French ${index}`
    ).join("\n");

    expect(() => parseChoiceOptionsCsv(rows)).toThrow("too-many-rows");
  });

  it("stringifies choices into the upload csv format", () => {
    expect(
      stringifyChoiceOptionsCsv([
        { en: "First", fr: "Premier" },
        { en: 'Second, with comma', fr: 'Deuxieme "quoted" value' },
      ])
    ).toBe(
      'en,fr\nFirst,Premier\n"Second, with comma","Deuxieme ""quoted"" value"'
    );
  });
});
