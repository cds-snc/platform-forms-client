/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import navigationFocus from "@root/__fixtures__/navigationFocus.json";
import { type FormProperties } from "@lib/types";
import { useTemplateValidationProblems } from "./useTemplateValidationProblems";
import { getSchemaFromState } from "@lib/utils/form-builder";
import { migrateTemplate } from "@lib/templates/schemaVersioning/migrateTemplate";
import { getTemplateMigrationProblems } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import { prepareTemplateForSave } from "@lib/utils/form-builder/prepareTemplateForSave";
import { validateTemplate, type TemplateValidationProblem } from "@lib/utils/form-builder/validate";

let form = structuredClone(navigationFocus) as FormProperties;
let validationFailure: { schema: string; problems: TemplateValidationProblem[] } | null = null;

vi.mock("@lib/hooks/form-builder/useTemplateContext", () => ({
  useTemplateContext: () => ({ validationFailure }),
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (select: (state: { form: FormProperties }) => unknown) => select({ form }),
}));

describe("useTemplateValidationProblems", () => {
  beforeEach(() => {
    form = structuredClone(navigationFocus) as FormProperties;
    validationFailure = null;
  });

  it("validates immutable editor state without sanitizing or modifying it", () => {
    form = structuredClone(navigationFocus) as FormProperties;
    form.titleEn = "<Title>";
    Object.freeze(form);
    form.elements.forEach((element) => {
      Object.freeze(element.properties);
      Object.freeze(element);
    });
    const original = structuredClone(form);
    const { result, rerender } = renderHook(() => useTemplateValidationProblems());
    expect(result.current).toEqual([]);
    expect(form).toEqual(original);

    form = { ...form, schemaVersion: 999 };
    rerender();
    expect(result.current).toContainEqual(
      expect.objectContaining({ path: "schemaVersion", name: "schema" })
    );
    expect(form.titleEn).toBe("<Title>");
  });

  it("reports nested errors revealed by migration after fixing a legacy draft", () => {
    const dropdown = (id: number): FormProperties["elements"][number] => ({
      id,
      type: "dropdown",
      properties: {
        titleEn: "Question",
        titleFr: "Question",
        validation: { required: false },
        choices: [
          { en: "A", fr: "A" },
          { en: "A", fr: "A" },
        ],
      },
    });
    form.schemaVersion = 1;
    form.elements = [
      dropdown(901),
      {
        id: 902,
        type: "dynamicRow",
        properties: {
          titleEn: "Repeating set",
          titleFr: "Questions",
          validation: { required: false },
          subElements: [dropdown(903)],
        },
      },
    ];
    form = migrateTemplate(form, { logFailure: false });
    expect(form.schemaVersion).toBe(1);
    form.elements[0].properties.choices!.pop();
    form.layout = [901, 902];
    Object.values(form.groups!).forEach((group) => {
      group.elements = [];
    });
    form.groups!.start.elements = ["901", "902"];
    const original = structuredClone(form);
    expect(getTemplateMigrationProblems(form)).toEqual([]);
    expect(validateTemplate(structuredClone(form)).problems).toEqual([]);

    const { result, rerender } = renderHook(() => useTemplateValidationProblems());
    const savedCandidate = prepareTemplateForSave(getSchemaFromState({ form }), {
      logFailure: false,
    });
    expect(result.current).toEqual(validateTemplate(savedCandidate).problems);
    expect(result.current).toContainEqual({
      path: "elements.1.properties.subElements.0.properties.choices",
      name: "uniqueItems",
      message: "contains duplicate item",
    });
    expect(form).toEqual(original);

    form = structuredClone(form);
    form.elements[1].properties.subElements![0].properties.choices!.pop();
    rerender();
    expect(result.current).toEqual([]);
    expect(form.schemaVersion).toBe(1);
  });

  it("uses server diagnostics for the submitted schema, then recomputes after edits", () => {
    const problems: TemplateValidationProblem[] = [
      { path: "titleEn", name: "type", message: "server validation failure" },
    ];
    validationFailure = {
      schema: JSON.stringify(getSchemaFromState({ form }), null, 2),
      problems,
    };
    const { result, rerender } = renderHook(() => useTemplateValidationProblems());
    expect(result.current).toEqual(problems);

    form = { ...form, titleEn: "Edited title" };
    rerender();
    expect(result.current).toEqual([]);

    form = { ...form, titleEn: navigationFocus.titleEn };
    validationFailure = null;
    rerender();
    expect(result.current).toEqual([]);
  });

  it("deduplicates server diagnostics while retaining distinct errors for the submitted schema", () => {
    const first = {
      path: "elements[0].properties.titleEn",
      name: "type",
      message: "Invalid title",
    };
    const second = { ...first, name: "required", message: "Missing title" };
    validationFailure = {
      schema: JSON.stringify(getSchemaFromState({ form }), null, 2),
      problems: [first, { ...first, path: "elements.0.properties.titleEn" }, second, { ...second }],
    };
    const original = structuredClone(validationFailure);
    const { result } = renderHook(() => useTemplateValidationProblems());
    expect(result.current).toEqual([first, second]);
    expect(validationFailure).toEqual(original);
  });
});
