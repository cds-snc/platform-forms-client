import { describe, expect, it, vi } from "vitest";
import { describeTemplateProblem } from "./describeTemplateProblem";
import { createTranslationMocks } from "@root/__utils__/translationTestHelpers";
import { type TemplateValidationProblem } from "@lib/utils/form-builder/validate";
import { type ProblemElement } from "@lib/templates/schemaVersioning/migrationProblemHelpers";

describe("describeTemplateProblem", () => {
  const issue: TemplateValidationProblem = {
    path: "elements[0].properties.choices",
    name: "uniqueItems",
    message: "contains duplicate item",
  };
  const element = {
    properties: {
      choices: [
        { en: "Ontario", fr: "Ontario" },
        { en: "Quebec", fr: "Québec" },
        { en: "Quebec", fr: "Québec" },
        { en: "Alberta", fr: "Alberta" },
        { en: "Alberta", fr: "Alberta" },
      ],
    },
  };

  it.each([
    ["en", "Quebec, Alberta"],
    ["fr", "Québec, Alberta"],
  ])("lists only duplicate labels once in %s", (language, choices) => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem(issue, element, language, t)).toBe(
      "migrationProblems.duplicateChoices"
    );
    expect(t.mock.calls).toEqual([["migrationProblems.duplicateChoices", { choices }]]);
  });

  it.each([
    { language: "en", choices: [{ fr: "Québec" }, { fr: "Québec" }], label: "Québec" },
    { language: "fr", choices: [{ en: "Quebec" }, { en: "Quebec" }], label: "Quebec" },
    { language: "en", choices: ["Quebec", "Quebec"], label: "Quebec" },
    { language: "en", choices: [7, 7], label: "7" },
  ])("handles duplicate label fallback: $language / $label", ({ language, choices, label }) => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem(issue, { properties: { choices } }, language, t)).toBe(
      "migrationProblems.duplicateChoices"
    );
    expect(t).toHaveBeenLastCalledWith("migrationProblems.duplicateChoices", { choices: label });
  });

  it.each<ProblemElement | undefined>([
    undefined,
    {},
    { properties: { choices: [] } },
    { properties: { choices: ["Ontario", "Quebec"] } },
  ])("falls back to a generic error when duplicate choices cannot be identified (%j)", (item) => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem(issue, item, "en", t)).toBe("migrationProblems.invalid");
    expect(t.mock.calls).toEqual([
      ["migrationProblems.fields.choices"],
      [
        "migrationProblems.invalid",
        {
          field: "migrationProblems.fields.choices",
          detail: issue.message,
        },
      ],
    ]);
  });

  it("describes duplicate conditional rules without inspecting choices", () => {
    const t = vi.fn((key: string) => key);

    expect(
      describeTemplateProblem(
        { ...issue, path: "elements[0].properties.conditionalRules" },
        element,
        "en",
        t
      )
    ).toBe("migrationProblems.duplicateRules");
    expect(t.mock.calls).toEqual([["migrationProblems.duplicateRules"]]);
  });

  it.each([
    ["minItems", "emptyList"],
    ["maxItems", "tooMany"],
    ["pattern", "invalidFormat"],
  ])("selects the message for %s", (name, messageKey) => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem({ ...issue, name }, undefined, "en", t)).toBe(
      `migrationProblems.${messageKey}`
    );
    expect(t.mock.calls).toEqual([
      ["migrationProblems.fields.choices"],
      [`migrationProblems.${messageKey}`, { field: "migrationProblems.fields.choices" }],
    ]);
  });

  it.each(["choices", "conditionalRules", "titleEn", "titleFr", "validation", "subElements"])(
    "translates the field label for %s",
    (field) => {
      const t = vi.fn((key: string) => key);

      expect(
        describeTemplateProblem(
          { ...issue, name: "pattern", path: `elements[0].properties.${field}` },
          undefined,
          "en",
          t
        )
      ).toBe("migrationProblems.invalidFormat");
      expect(t).toHaveBeenLastCalledWith("migrationProblems.invalidFormat", {
        field: `migrationProblems.fields.${field}`,
      });
    }
  );

  it.each(['requires property "titleEn"', "Missing required value"])(
    "uses the missing property's path independently of message wording: %s",
    (message) => {
      const t = vi.fn((key: string) => key);

      expect(
        describeTemplateProblem(
          { name: "required", path: "elements[0].properties.titleEn", message },
          undefined,
          "en",
          t
        )
      ).toBe("migrationProblems.required");
      expect(t.mock.calls).toEqual([
        ["migrationProblems.fields.titleEn"],
        ["migrationProblems.required", { field: "migrationProblems.fields.titleEn" }],
      ]);
    }
  );

  it.each([
    { name: "required", path: "", key: "required", field: "migrationProblems.field" },
    { name: "type", path: "", key: "invalid", field: "migrationProblems.field" },
    {
      name: "type",
      path: "elements[0].properties.customField",
      key: "invalid",
      field: "customField",
    },
  ])("handles a missing or unknown field for $name / $field", ({ name, path, key, field }) => {
    const t = vi.fn((translationKey: string) => translationKey);

    expect(describeTemplateProblem({ ...issue, name, path }, undefined, "en", t)).toBe(
      `migrationProblems.${key}`
    );
    expect(t).toHaveBeenLastCalledWith(`migrationProblems.${key}`, {
      field,
      ...(key === "invalid" ? { detail: issue.message } : {}),
    });
  });

  it("passes template-level translation keys through unchanged", () => {
    const t = vi.fn((key: string) => key);
    const message = "validationProblems.invalidTemplate";

    expect(
      describeTemplateProblem({ name: "template", path: "", message }, undefined, "en", t)
    ).toBe(message);
    expect(t.mock.calls).toEqual([[message]]);
  });

  it("passes the affected property to schema-level translations", () => {
    const t = vi.fn((key: string) => key);
    const message = "validationProblems.unsupportedVersion";

    expect(
      describeTemplateProblem({ name: "schema", path: "version", message }, undefined, "en", t)
    ).toBe(message);
    expect(t.mock.calls).toEqual([[message, { property: "version" }]]);
  });

  it("describes a failed migration", () => {
    const t = vi.fn((key: string) => key);

    expect(
      describeTemplateProblem({ ...issue, name: "migration", fromVersion: 1 }, undefined, "en", t)
    ).toBe("migrationProblems.cannotUpgrade");
    expect(t).toHaveBeenLastCalledWith("migrationProblems.cannotUpgrade");
  });

  it.each([
    ["en", "Duplicate choices: Quebec, Alberta. Remove or change the repeated choices."],
    ["fr", "Choix en double : Québec, Alberta. Supprimez ou modifiez les choix répétés."],
  ])("renders the complete translated message in %s", (language, expected) => {
    const { t } = createTranslationMocks().useTranslation("form-builder", { lng: language });

    expect(describeTemplateProblem(issue, element, language, t)).toBe(expected);
  });
});
