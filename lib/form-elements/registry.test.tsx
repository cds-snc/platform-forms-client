import { describe, expect, it } from "vitest";
import { FormElementTypes } from "@lib/types";
import { getElementDefinition } from "./registry";

describe("registry", () => {
  it("returns the formatted date client hooks", () => {
    const definition = getElementDefinition(FormElementTypes.formattedDate);
    const option = definition?.buildAddElementOption?.({
      t: (key) => key,
      groups: {
        preset: { id: "preset", value: "Preset" },
      },
    });

    expect(option).toMatchObject({
      id: FormElementTypes.formattedDate,
      value: "formattedDate",
      group: { id: "preset", value: "Preset" },
      displayOrder: 30,
    });
    expect(definition?.renderPublic).toBeTypeOf("function");
    expect(definition?.renderReview).toBeTypeOf("function");
    expect(definition?.renderBuilderPreview).toBeTypeOf("function");
    expect(definition?.renderPanelBodyAction).toBeTypeOf("function");
    expect(definition?.EditOptionsComponent).toBeDefined();
  });

  it("returns the formatted date shared hooks", () => {
    const formattedDate = getElementDefinition(FormElementTypes.formattedDate);
    expect(formattedDate?.normalizeResponse).toBeTypeOf("function");
    expect(formattedDate?.answerToString).toBeTypeOf("function");
    expect(formattedDate?.getErrorListMessage).toBeTypeOf("function");

    expect(
      formattedDate?.getErrorListMessage?.({
        question: "Date of birth",
        language: "en",
        t: (key, options) => `${key}:${String(options?.question)}`,
      })
    ).toBe("input-validation.error-list.date-invalid:Date of birth");
  });

  it("returns the number input client hooks", () => {
    const definition = getElementDefinition(FormElementTypes.numberInput);
    const option = definition?.buildAddElementOption?.({
      t: (key) => key,
      groups: {
        preset: { id: "preset", value: "Preset" },
      },
    });

    expect(option).toMatchObject({
      id: "number",
      value: "numericField",
      group: { id: "preset", value: "Preset" },
    });
    expect(definition?.renderPublic).toBeTypeOf("function");
    expect(definition?.renderReview).toBeTypeOf("function");
    expect(definition?.renderBuilderPreview).toBeTypeOf("function");
    expect(definition?.EditOptionsComponent).toBeDefined();
  });
});
