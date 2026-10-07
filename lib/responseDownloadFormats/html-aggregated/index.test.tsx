import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResponseHtmlAggregated } from "./components/ResponseHTMLAggregated";
import { type FormRecord } from "@lib/types";
import { type FormResponseSubmissions } from "../types";

const formRecord = {
  id: "form-1",
  name: "Test form",
  form: {
    titleEn: "English title",
    titleFr: "Titre français",
    layout: [],
    elements: [],
  },
  isPublished: true,
  versionNumber: 3,
  currentPublishedVersionId: null,
  currentDraftVersionId: null,
  currentPublishedVersion: 3,
  currentDraftVersion: null,
  securityAttribute: "Protected A",
  formPurpose: "",
  publishReason: "",
  publishFormType: "",
  publishDesc: "",
  saveAndResume: true,
  notificationsInterval: 1440,
  closedDetails: null,
} as unknown as FormRecord;

const formResponseSubmissions = {
  formRecord,
  submissions: [
    {
      id: "response-1",
      createdAt: 1_700_000_000_000,
      confirmationCode: "ABC123",
      answers: [],
    },
  ],
} as unknown as FormResponseSubmissions;

describe("ResponseHtmlAggregated", () => {
  it("renders the version badge in the aggregated html output", () => {
    const markup = renderToStaticMarkup(
      ResponseHtmlAggregated({
        lang: "en",
        formResponseSubmissions,
        host: "https://example.com",
      })
    );

    expect(markup).toContain("Version 3");
  });
});
