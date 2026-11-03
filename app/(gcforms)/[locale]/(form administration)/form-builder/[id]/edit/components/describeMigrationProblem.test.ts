import { describe, expect, it } from "vitest";
import { describeMigrationProblem } from "./describeMigrationProblem";
import en from "@i18n/translations/en/form-builder.json";
import fr from "@i18n/translations/fr/form-builder.json";

const translate = (language: "en" | "fr") => (key: string, values?: Record<string, unknown>) => {
  const parts = key.split(".");
  let value: unknown = language === "en" ? en : fr;
  for (const part of parts) value = (value as Record<string, unknown>)[part];
  return String(value).replace(/{{(.*?)}}/g, (_, name: string) => String(values?.[name]));
};

describe("describeMigrationProblem", () => {
  const issue = {
    path: "elements[0].properties.choices",
    name: "uniqueItems",
    message: "contains duplicate item",
    fromVersion: 1,
  };
  const element = {
    properties: {
      titleEn: "Select a province",
      choices: [
        { en: "Ontario", fr: "Ontario" },
        { en: "Quebec", fr: "Québec" },
        { en: "Quebec", fr: "Québec" },
      ],
    },
  };

  it("identifies repeated choices by their localized label", () => {
    expect(describeMigrationProblem(issue, element, "en", translate("en"))).toContain("Quebec");
    expect(describeMigrationProblem(issue, element, "fr", translate("fr"))).toContain("Québec");
  });

  it("names missing properties instead of showing the JSON path", () => {
    expect(
      describeMigrationProblem(
        {
          path: "elements[0].properties",
          name: "required",
          message: 'requires property "titleEn"',
          fromVersion: 1,
        },
        element,
        "en",
        translate("en")
      )
    ).toContain("English question title");
  });

  it("explains empty lists and repeated conditional rules", () => {
    expect(
      describeMigrationProblem(
        { ...issue, name: "minItems", message: "does not meet minimum length of 1" },
        element,
        "en",
        translate("en")
      )
    ).toContain("Choices needs at least one entry");
    expect(
      describeMigrationProblem(
        { ...issue, path: "elements[0].properties.conditionalRules" },
        element,
        "fr",
        translate("fr")
      )
    ).toContain("règles conditionnelles");
  });
});
