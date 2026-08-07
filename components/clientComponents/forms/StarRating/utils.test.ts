import { describe, expect, it } from "vitest";
import {
  checkAndformatStarRatingAnswer,
  parseStarRatingAnswer,
  formatStarRating,
  formatStarRatingAnswer,
} from "./utils";
import { FormElementTypes } from "@lib/types";

describe("parseStarRatingAnswer", () => {
  it("returns the object when both value and numberOfStars are present", () => {
    const answer = { value: 3, numberOfStars: 5 };
    expect(parseStarRatingAnswer(answer)).toEqual(answer);
  });

  it("returns undefined for null", () => {
    expect(parseStarRatingAnswer(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(parseStarRatingAnswer(undefined)).toBeUndefined();
  });

  it("returns undefined for a plain string", () => {
    expect(parseStarRatingAnswer("3/5")).toBeUndefined();
  });

  it("returns undefined when value is missing", () => {
    expect(parseStarRatingAnswer({ numberOfStars: 5 })).toBeUndefined();
  });

  it("returns undefined when numberOfStars is missing", () => {
    expect(parseStarRatingAnswer({ value: 3 })).toBeUndefined();
  });
});

describe("formatStarRating", () => {
  it("formats value and numberOfStars as a fraction", () => {
    expect(formatStarRating(3, 5)).toBe("3/5");
  });

  it("returns the value string when numberOfStars is 0", () => {
    expect(formatStarRating(3, 0)).toBe("3");
  });

  it("returns the value string when numberOfStars is negative", () => {
    expect(formatStarRating(3, -1)).toBe("3");
  });

  it("returns the string representation when value is 0 (falsy)", () => {
    expect(formatStarRating(0, 5)).toBe("0");
  });

  it("returns '-' string unchanged when value is '-'", () => {
    expect(formatStarRating("-", 5)).toBe("-");
  });
});

describe("formatStarRatingAnswer", () => {
  it("formats a valid StarRatingObject as a fraction", () => {
    expect(formatStarRatingAnswer({ value: 4, numberOfStars: 5 })).toBe("4/5");
  });

  it("returns '-' for null", () => {
    expect(formatStarRatingAnswer(null)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatStarRatingAnswer(undefined)).toBe("-");
  });

  it("returns '-' for a plain string", () => {
    expect(formatStarRatingAnswer("3")).toBe("-");
  });

  it("returns '-' for an object missing required properties", () => {
    expect(formatStarRatingAnswer({ value: 3 })).toBe("-");
  });

  it("formats a minimum rating of 1", () => {
    expect(formatStarRatingAnswer({ value: 1, numberOfStars: 5 })).toBe("1/5");
  });

  it("formats a rating equal to numberOfStars", () => {
    expect(formatStarRatingAnswer({ value: 5, numberOfStars: 5 })).toBe("5/5");
  });
});

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
        answer: { value: 3, numberOfStars: 5 } as unknown as string,
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
        answer: { value: 7, numberOfStars: 10 } as unknown as string,
        type: FormElementTypes.starRating,
      }
    );

    expect(result).toBe("7/10");
  });

  it("returns '-' for a null answer", () => {
    const result = checkAndformatStarRatingAnswer({
      questionId: 1,
      questionEn: "Rating",
      questionFr: "Évaluation",
      answer: null as unknown as string,
      type: FormElementTypes.starRating,
    });

    expect(result).toBe("-");
  });
});
