import { describe, it, expect } from "vitest";
import { mapAnswers } from "./mapAnswers";
import { type MappedAnswer } from "./types";
import kitchen from "../__fixtures__/kitchen-sink-form-application-2025-10-10.json";
import answersFixture from "../__fixtures__/answers.json";
import type { PublicFormRecord } from "@gcforms/types";
import { FormProperties } from "@root/packages/types/dist";

describe("mapAnswers", () => {
  it("maps kitchen-sink fixture answers into mapped answer objects", () => {
    const template = {
      id: "kitchen",
      form: kitchen,
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    // answers.json stores the answers as a JSON string under the `answers` key
    const rawAnswers = JSON.parse((answersFixture as unknown as { answers: string }).answers);

    const mapped = mapAnswers({ formTemplate: template.form as FormProperties, rawAnswers });

    const radio = mapped[2];
    expect(radio.type).toBe("radio");
    expect(radio.questionId).toBe(5);
    expect(radio.answer).toBe("English");
  });

  it("creates a fallback mapped answer when question definition is missing", () => {
    const template = {
      id: "minimal",
      form: { elements: [] },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    const rawAnswers = { "42": { foo: "bar" } } as Record<string, unknown> as Record<
      string,
      Response
    >;

    const mapped = mapAnswers({ formTemplate: template.form as FormProperties, rawAnswers });

    expect(mapped.length).toBe(1);
    const first = mapped[0];
    if (typeof first === "string") throw new Error("expected object mapped answer");
    expect(first.type).toBe("-");
    expect(typeof first.answer).toBe("string");
    expect(String(first.answer)).toContain('"foo":"bar"');
  });

  it("handles dynamicRow answers (array of rows) and returns nested mapped answers", () => {
    const template = {
      id: "dynamic",
      form: {
        elements: [
          {
            id: 7,
            type: "dynamicRow",
            properties: {
              subElements: [
                { id: 70, type: "textField", properties: { titleEn: "A" } },
                { id: 71, type: "textField", properties: { titleEn: "B" } },
              ],
            },
          },
        ],
      },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    const rawAnswers = {
      "7": [
        ["row1col1", "row1col2"],
        ["r2c1", "r2c2"],
      ],
    } as unknown as Record<string, Response>;

    const mapped = mapAnswers({ formTemplate: template.form as FormProperties, rawAnswers });

    expect(mapped.length).toBe(1);
    const dyn = mapped[0];
    if (typeof dyn === "string") throw new Error("expected object mapped answer for dynamicRow");
    expect(Array.isArray(dyn.answer)).toBe(true);
    const firstRow = (dyn.answer as MappedAnswer[][])[0];
    expect(Array.isArray(firstRow)).toBe(true);
    const firstCell = firstRow[0];
    if (typeof firstCell === "string") throw new Error("expected object cell");
    expect(typeof firstCell.answer === "string").toBe(true);
  });
});
