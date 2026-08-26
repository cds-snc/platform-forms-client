import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RowTable } from "./RowTable";
import { FormElementTypes, FormRecord } from "@lib/types";
import { Submission } from "../../types";

const mockFormRecord = {
  id: "form-1",
  name: "Test form",
  form: {
    titleEn: "English title",
    titleFr: "Titre français",
    layout: [1, 2, 3],
    elements: [
      {
        id: 1,
        type: FormElementTypes.textField,
        properties: { titleEn: "Name", titleFr: "Nom" },
      },
      {
        id: 2,
        type: FormElementTypes.starRating,
        properties: { titleEn: "Rating", titleFr: "Évaluation", numberOfStars: 5 },
      },
      {
        id: 3,
        type: FormElementTypes.numberInput,
        properties: { titleEn: "Age", titleFr: "Âge" },
      },
    ],
  },
  isPublished: true,
  versionNumber: 1,
} as unknown as FormRecord;

const mockSubmission: Submission = {
  id: "response-1",
  createdAt: 1_700_000_000_000,
  confirmationCode: "ABC123",
  answers: [
    {
      questionId: 1,
      type: FormElementTypes.textField,
      questionEn: "Name",
      questionFr: "Nom",
      answer: "John Doe",
    },
    {
      questionId: 2,
      type: FormElementTypes.starRating,
      questionEn: "Rating",
      questionFr: "Évaluation",
      answer: JSON.stringify({ value: 4, numberOfStars: 5 }),
    },
    {
      questionId: 3,
      type: FormElementTypes.numberInput,
      questionEn: "Age",
      questionFr: "Âge",
      answer: "30",
    },
  ],
};

describe("RowTable", () => {
  it("renders text fields, star ratings, and number inputs correctly without turning text into '-'", () => {
    const markup = renderToStaticMarkup(
      RowTable({
        responseID: "response-1",
        submissionDate: 1_700_000_000_000,
        submission: mockSubmission,
        lang: "en",
        formRecord: mockFormRecord,
      })
    );

    expect(markup).toContain("John Doe");
    expect(markup).toContain("4 out of 5");
    expect(markup).toContain("30");
  });
});
