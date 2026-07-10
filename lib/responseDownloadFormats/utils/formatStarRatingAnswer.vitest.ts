import { describe, expect, it, vi, beforeEach } from "vitest";

import { formatStarRatingAnswer } from "./formatStarRatingAnswer";
import { FormElementTypes, FormRecord } from "@lib/types";
import { getElementOrSubElementById } from "@gcforms/core";

vi.mock("@gcforms/core", () => ({
  getElementOrSubElementById: vi.fn(),
}));

const baseFormRecord = { form: { elements: [] } } as unknown as FormRecord;

describe("formatStarRatingAnswer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(getElementOrSubElementById).not.toHaveBeenCalled();
  });

  it("passes through a placeholder '-' answer unchanged", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue({
      properties: { numberOfStars: 5 },
    } as ReturnType<typeof getElementOrSubElementById>);

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
    expect(getElementOrSubElementById).not.toHaveBeenCalled();
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
    expect(getElementOrSubElementById).not.toHaveBeenCalled();
  });

  it("formats the answer as a fraction using numberOfStars from the element", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue({
      properties: { numberOfStars: 5 },
    } as ReturnType<typeof getElementOrSubElementById>);

    const result = formatStarRatingAnswer(
      {
        questionId: 42,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "3",
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(getElementOrSubElementById).toHaveBeenCalledWith(baseFormRecord.form.elements, "42");
    expect(result).toBe("3/5");
  });

  it("uses a default of 5 stars when the element has no numberOfStars property", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue({
      properties: {},
    } as ReturnType<typeof getElementOrSubElementById>);

    const result = formatStarRatingAnswer(
      {
        questionId: 7,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "4",
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("4/5");
  });

  it("uses a default of 5 stars when the element cannot be found", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue(undefined);

    const result = formatStarRatingAnswer(
      {
        questionId: 99,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "2",
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("2/5");
  });

  it("formats a non-default star count correctly", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue({
      properties: { numberOfStars: 10 },
    } as ReturnType<typeof getElementOrSubElementById>);

    const result = formatStarRatingAnswer(
      {
        questionId: 5,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: "7",
        type: FormElementTypes.starRating,
      },
      baseFormRecord
    );

    expect(result).toBe("7/10");
  });
});
