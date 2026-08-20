import { describe, expect, it } from "vitest";
import { checkAndformatStarRatingAnswer, formatStarRatingAnswer } from "./utils";
import { FormElementTypes } from "@lib/types";

describe("formatStarRatingAnswer", () => {
  it("returns the raw string unchanged", () => {
    expect(formatStarRatingAnswer("4")).toBe("4");
  });

  it("returns '-' for an empty string", () => {
    expect(formatStarRatingAnswer("")).toBe("-");
  });

  it("returns '-' for null", () => {
    expect(formatStarRatingAnswer(null as unknown as string)).toBe("-");
  });

  it("returns '-' for undefined", () => {
    expect(formatStarRatingAnswer(undefined as unknown as string)).toBe("-");
  });
});

describe("checkAndformatStarRatingAnswer", () => {
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

  it("returns the plain number string for a valid rating", () => {
    const result = checkAndformatStarRatingAnswer({
      questionId: 42,
      questionEn: "Rating",
      questionFr: "Évaluation",
      answer: "3",
      type: FormElementTypes.starRating,
    });
    expect(result).toBe("3");
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
});
