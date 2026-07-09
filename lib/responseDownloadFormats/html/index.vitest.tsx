import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { type TFunction } from "i18next";
import { ResponseHtml } from "./components/ResponseHtml";
import { type FormRecord } from "@lib/types";
import { type Submission } from "../types";

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

const submission = {
  id: "response-1",
  createdAt: 1_700_000_000_000,
  confirmationCode: "ABC123",
  answers: [],
} as Submission;

const t = ((key: string) => key) as TFunction<string | string[], undefined>;

describe("ResponseHtml", () => {
  it("renders the version badge in the html output", () => {
    const markup = renderToStaticMarkup(
      ResponseHtml({
        response: submission,
        formRecord,
        confirmationCode: "ABC123",
        responseID: "response-1",
        createdAt: 1_700_000_000_000,
        securityAttribute: "Protected A",
        showCodes: false,
        t,
      })
    );

    expect(markup).toContain("Version 3");
  });
});
