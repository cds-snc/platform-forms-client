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

  it("describes duplicate choices", () => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem(issue, element, t)).toBe("migrationProblems.duplicateChoices");
    expect(t.mock.calls).toEqual([["migrationProblems.duplicateChoices"]]);
  });

  it.each<ProblemElement | undefined>([
    undefined,
    {},
    { properties: { choices: [] } },
    { properties: { choices: ["Ontario", "Quebec"] } },
  ])("falls back to a generic error when duplicate choices cannot be identified (%j)", (item) => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem(issue, item, t)).toBe("migrationProblems.invalid");
    expect(t.mock.calls).toEqual([["migrationProblems.invalid", { detail: issue.message }]]);
  });

  it("describes duplicate conditional rules without inspecting choices", () => {
    const t = vi.fn((key: string) => key);

    expect(
      describeTemplateProblem(
        { ...issue, path: "elements[0].properties.conditionalRules" },
        element,
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

    expect(describeTemplateProblem({ ...issue, name }, undefined, t)).toBe(
      `migrationProblems.${messageKey}`
    );
    expect(t.mock.calls).toEqual([[`migrationProblems.${messageKey}`]]);
  });

  it.each(['requires property "titleEn"', "Missing required value"])(
    "ignores message wording: %s",
    (message) => {
      const t = vi.fn((key: string) => key);

      expect(
        describeTemplateProblem(
          { name: "required", path: "elements[0].properties.titleEn", message },
          undefined,
          t
        )
      ).toBe("migrationProblems.required");
      expect(t.mock.calls).toEqual([["migrationProblems.required"]]);
    }
  );

  it("includes the problem detail for other problem types", () => {
    const t = vi.fn((key: string) => key);

    expect(describeTemplateProblem({ ...issue, name: "type" }, undefined, t)).toBe(
      "migrationProblems.invalid"
    );
    expect(t.mock.calls).toEqual([["migrationProblems.invalid", { detail: issue.message }]]);
  });

  it("passes template-level translation keys through unchanged", () => {
    const t = vi.fn((key: string) => key);
    const message = "validationProblems.invalidTemplate";

    expect(describeTemplateProblem({ name: "template", path: "", message }, undefined, t)).toBe(
      message
    );
    expect(t.mock.calls).toEqual([[message]]);
  });

  it("passes the affected property to schema-level translations", () => {
    const t = vi.fn((key: string) => key);
    const message = "validationProblems.unsupportedVersion";

    expect(
      describeTemplateProblem({ name: "schema", path: "version", message }, undefined, t)
    ).toBe(message);
    expect(t.mock.calls).toEqual([[message, { property: "version" }]]);
  });

  it("describes a failed migration", () => {
    const t = vi.fn((key: string) => key);

    expect(
      describeTemplateProblem({ ...issue, name: "migration", fromVersion: 1 }, undefined, t)
    ).toBe("migrationProblems.cannotUpgrade");
    expect(t).toHaveBeenLastCalledWith("migrationProblems.cannotUpgrade");
  });

  it.each([
    ["en", "Remove or change duplicate options."],
    ["fr", "Supprimez ou modifiez les options en double."],
  ])("renders the complete translated message in %s", (language, expected) => {
    const { t } = createTranslationMocks().useTranslation("form-builder", { lng: language });

    expect(describeTemplateProblem(issue, element, t)).toBe(expected);
  });
});
