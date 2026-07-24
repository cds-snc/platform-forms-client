import { describe, expect, it } from "vitest";

import { formatStarRatingAnswer } from "./formatStarRatingAnswer";
import { FormElementTypes, FormRecord } from "@lib/types";

const baseFormRecord = { form: { elements: [] } } as unknown as FormRecord;

describe("formatStarRatingAnswer", () => {
  it("returns undefined for non-starRating element types", () => {
    const result = formatStarRatingAnswer(
      {
        questionId: 1,
        questionEn: "Question",
        questionFr: "Question",
        answer: "3",
        type: FormElementTypes.radio,
      },
      baseFormRecord
    );

    expect(result).toBeUndefined();
  });

  it("passes through a placeholder '-' answer unchanged", () => {
    const result = formatStarRatingAnswer(
      {
        questionId: 1,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "-",
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("-");
  });

  it("passes through an empty answer unchanged", () => {
    const result = formatStarRatingAnswer(
      {
        questionId: 1,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "",
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("");
  });

  it("formats the answer from a JSON object with value and numberOfStars", () => {
    const result = formatStarRatingAnswer(
      {
        questionId: 42,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: JSON.stringify({ value: 3, numberOfStars: 5 }),
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("3/5");
  });

  it("formats with a non-default star count from JSON", () => {
    const result = formatStarRatingAnswer(
      {
        questionId: 5,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: JSON.stringify({ value: 7, numberOfStars: 10 }),
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("7/10");
  });
});
