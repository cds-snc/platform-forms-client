import { describe, expect, it } from "vitest";
import {
  checkAndformatStarRatingAnswer,
  parseStarRatingAnswer,
  formatStarRating,
  formatStarRatingAnswer,
  formatStarRatingAnswerForCsv,
} from "./utils";
import { FormElementTypes } from "@lib/types";

describe("parseStarRatingAnswer", () => {
  it("returns the object when a JSON string contains value and numberOfStars", () => {
    const answer = JSON.stringify({ value: 3, numberOfStars: 5 });
    expect(parseStarRatingAnswer(answer)).toEqual({ value: 3, numberOfStars: 5 });
  });

  it("returns undefined for null", () => {
    expect(parseStarRatingAnswer(null as unknown as string)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(parseStarRatingAnswer(undefined as unknown as string)).toBeUndefined();
  });

  it("returns undefined for a plain string", () => {
    expect(parseStarRatingAnswer("3/5")).toBeUndefined();
  });

  it("returns undefined when value is missing", () => {
    expect(parseStarRatingAnswer(JSON.stringify({ numberOfStars: 5 }))).toBeUndefined();
  });

  it("returns undefined when numberOfStars is missing", () => {
    expect(parseStarRatingAnswer(JSON.stringify({ value: 3 }))).toBeUndefined();
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
  it("formats a valid JSON star rating as a fraction", () => {
    expect(formatStarRatingAnswer(JSON.stringify({ value: 4, numberOfStars: 5 }))).toBe("4/5");
  });

  it("returns '-' for null", () => {
    expect(formatStarRatingAnswer(null as unknown as string)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatStarRatingAnswer(undefined as unknown as string)).toBe("-");
  });

  it("returns an unparseable string unchanged", () => {
    expect(formatStarRatingAnswer("3")).toBe("3");
  });

  it("returns JSON with missing required properties unchanged", () => {
    const answer = JSON.stringify({ value: 3 });
    expect(formatStarRatingAnswer(answer)).toBe(answer);
  });

  it("formats a minimum rating of 1", () => {
    expect(formatStarRatingAnswer(JSON.stringify({ value: 1, numberOfStars: 5 }))).toBe("1/5");
  });

  it("formats a rating equal to numberOfStars", () => {
    expect(formatStarRatingAnswer(JSON.stringify({ value: 5, numberOfStars: 5 }))).toBe("5/5");
  });
});

describe("formatStarRatingAnswerForCsv", () => {
  it("prefixes the fraction so Excel keeps it as text", () => {
    expect(formatStarRatingAnswerForCsv(JSON.stringify({ value: 5, numberOfStars: 5 }))).toBe(
      "'5/5"
    );
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

  it("formats the answer from a JSON string with value and numberOfStars", () => {
    const result = checkAndformatStarRatingAnswer({
      questionId: 42,
      questionEn: "Rating",
      questionFr: "Évaluation",
      answer: JSON.stringify({ value: 3, numberOfStars: 5 }),
      type: FormElementTypes.starRating,
    });

    expect(result).toBe("3/5");
  });

  it("formats with a non-default star count from JSON", () => {
    const result = checkAndformatStarRatingAnswer({
      questionId: 5,
      questionEn: "Rating",
      questionFr: "Évaluation",
      answer: JSON.stringify({ value: 7, numberOfStars: 10 }),
      type: FormElementTypes.starRating,
    });

    expect(result).toBe("7/10");
  });

  it("returns the string representation of a null answer", () => {
    const result = checkAndformatStarRatingAnswer({
      questionId: 1,
      questionEn: "Rating",
      questionFr: "Évaluation",
      answer: null as unknown as string,
      type: FormElementTypes.starRating,
    });

    expect(result).toBe("null");
  });
});
