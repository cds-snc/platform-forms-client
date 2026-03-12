/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import { parseChoiceOptionsCsv } from "./ChoiceOptionsCsvUpload";

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
});
