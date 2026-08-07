import { describe, expect, it } from "vitest";
import { checkAndformatStarRatingAnswer } from "./utils";
import { FormElementTypes } from "@lib/types";


describe("formatStarRatingAnswer", () => {
  it("returns undefined for non-starRating element types", () => {
    const result = checkAndformatStarRatingAnswer({
        questionId: 1,
        questionEn: "Question",
        questionFr: "Question",
        answer: "3",
        type: FormElementTypes.radio,
      });

    expect(result).toBeUndefined();
  });

  it("passes through a placeholder '-' answer unchanged", () => {
    const result = checkAndformatStarRatingAnswer({
        questionId: 1,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "-",
        type: FormElementTypes.starRating,
      });

    expect(result).toBe("-");
  });

  it("returns '-' for an empty answer", () => {
    const result = checkAndformatStarRatingAnswer({
        questionId: 1,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "",
        type: FormElementTypes.starRating,
      });

    expect(result).toBe("-");
  });

  it("formats the answer from a JSON object with value and numberOfStars", () => {
    const result = checkAndformatStarRatingAnswer({
        questionId: 42,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: { value: 3, numberOfStars: 5 },
        type: FormElementTypes.starRating,
      });

    expect(result).toBe("3/5");
  });

  it("formats with a non-default star count from JSON", () => {
    const result = checkAndformatStarRatingAnswer(
      {
        questionId: 5,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: { value: 7, numberOfStars: 10 },
        type: FormElementTypes.starRating,
      }
    );

    expect(result).toBe("7/10");
  });
});
