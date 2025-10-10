import { describe, it, expect } from "vitest";
import { mapAnswers, type MappedAnswer } from "../../app/(gcforms)/[locale]/(form administration)/api_integration/lib/mapAnswers/mapAnswers";
import kitchen from "../../app/(gcforms)/[locale]/(form administration)/api_integration/lib/mapAnswers/__fixtures__/kitchen-sink-form-application-2025-10-10.json";
import answersFixture from "../../app/(gcforms)/[locale]/(form administration)/api_integration/lib/mapAnswers/__fixtures__/answers.json";
import type { PublicFormRecord } from "@gcforms/types";

describe("mapAnswers", () => {
  it("maps kitchen-sink fixture answers into mapped answer objects", () => {
    const template = {
      id: "kitchen",
      form: kitchen,
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    const rawAnswers = JSON.parse((answersFixture as unknown as { answers: string }).answers) as Record<
      string,
      unknown
    >;

    const mapped = mapAnswers({ template, rawAnswers });

    expect(Array.isArray(mapped)).toBe(true);
    expect(mapped.length).toBeGreaterThan(0);

    // helper: narrow to answer objects with numeric questionId
    const isAnswerWithId = (id: number) => (m: unknown): m is (MappedAnswer & { questionId: number }) => {
      return typeof m === "object" && m !== null && typeof (m as Record<string, unknown>).questionId === "number" &&
        (m as Record<string, unknown>).questionId === id;
    };

    const phone = mapped.find(isAnswerWithId(3));
    expect(phone).toBeDefined();
    if (!phone || typeof phone === "string") throw new Error("expected phone object");
    expect(String((phone as Record<string, unknown>).answer)).toBe("111-222-3333");

    // dynamicRow handling now returns nested rows (MappedAnswer[][]) for question 36
    const dyn = mapped.find(isAnswerWithId(36));
    expect(dyn).toBeDefined();
    if (!dyn || typeof dyn === "string") throw new Error("expected dynamicRow object");
    const dynAnswer = (dyn as Record<string, unknown>).answer;
    expect(Array.isArray(dynAnswer)).toBe(true);
    const rows = dynAnswer as unknown[];
    expect(rows.length).toBeGreaterThanOrEqual(1);
    // first row first cell should be a mapped object with questionId 3601 and answer 'Dave'
    const firstCell = rows[0] as unknown[];
    expect(Array.isArray(firstCell)).toBe(true);
    const firstCellFirst = firstCell[0] as Record<string, unknown>;
    expect(firstCellFirst.questionId).toBe(3601);
    expect(String(firstCellFirst.answer)).toBe("Dave");
  });
});
