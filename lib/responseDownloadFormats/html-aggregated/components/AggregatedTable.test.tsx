import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AggregatedTable } from "./AggregatedTable";
import { FormElementTypes, FormRecord } from "@lib/types";
import { Submission } from "@lib/responseDownloadFormats/types";

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

const mockSubmissions: Submission[] = [
  {
    id: "response-1",
    createdAt: 1_700_000_000_000,
    confirmationCode: "ABC123",
    answers: [
      {
        questionId: 1,
        type: FormElementTypes.textField,
        questionEn: "Name",
        questionFr: "Nom",
        answer: "Jane Doe",
      },
      {
        questionId: 2,
        type: FormElementTypes.starRating,
        questionEn: "Rating",
        questionFr: "Évaluation",
        answer: JSON.stringify({ value: 5, numberOfStars: 5 }),
      },
      {
        questionId: 3,
        type: FormElementTypes.numberInput,
        questionEn: "Age",
        questionFr: "Âge",
        answer: "25",
      },
    ],
  },
];

describe("AggregatedTable", () => {
  it("renders text fields, star ratings, and number inputs correctly without turning text into '-'", () => {
    const markup = renderToStaticMarkup(
      AggregatedTable({
        lang: "en",
        headers: [
          { title: "Response ID", type: "text" },
          { title: "Date", type: "text" },
          { title: "Name", type: "text" },
          { title: "Rating", type: "text" },
          { title: "Age", type: "text" },
        ],
        submissions: mockSubmissions,
        formRecord: mockFormRecord,
      })
    );

    expect(markup).toContain("Jane Doe");
    expect(markup).toContain("5 out of 5");
    expect(markup).toContain("25");
  });
});
