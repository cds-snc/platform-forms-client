"use server";

import { promises as fs } from "fs";

import { type ReviewSection } from "../Review/helpers";
import { type SecurityAttribute } from "@lib/types";
import { css } from "@lib/responseDownloadFormats/html/css/compiled";

import { ProtectedWarning } from "@lib/responseDownloadFormats/html/components/ProtectedWarning";
import Fip from "@lib/responseDownloadFormats/html/components/Fip";
import { ReviewList } from "../Review/ReviewList";

export const saveProgressData = async ({
  formTitle,
  securityAttribute,
  responseData,
  reviewItems,
}: {
  formTitle: string;
  securityAttribute: SecurityAttribute;
  responseData: string;
  reviewItems: ReviewSection[];
}) => {
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

  const review = renderToStaticMarkup(
    ReviewList({ language: "en", reviewItems, startSectionTitle: "Start" })
  );

  const FIP = renderToStaticMarkup(Fip({ language: "en", showLangLink: false }));
  const protectedWarning = renderToStaticMarkup(
    ProtectedWarning({ lang: "en", securityAttribute })
  );

  try {
    const dir = "public/static/save-and-resume";
    let fileContents = await fs.readFile(dir + `/response.html`, "utf8");

    // Replace placeholders with form data
    fileContents = fileContents.replace(/{{CSS}}/g, `<style>${css}</style>`);
    fileContents = fileContents.replace(/{{ProtectedWarning}}/g, protectedWarning);
    fileContents = fileContents.replace(/{{Fip}}/g, FIP);
    fileContents = fileContents.replace(/{{FORM_TITLE}}/g, formTitle);
    fileContents = fileContents.replace(/{{FORM_DATA_BASE64}}/g, responseData);
    fileContents = fileContents.replace(/{{FORM_REVIEW}}/g, review);

    return { data: fileContents };
  } catch (error) {
    return { data: "", error: (error as Error).message };
  }
};
