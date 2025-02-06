import React from "react";

import { type ReviewSection } from "../../Review/helpers";
import { type SecurityAttribute } from "@lib/types";

import Fip from "@lib/responseDownloadFormats/html/components/Fip";
import { ReviewList } from "../../Review/ReviewList";

import { css } from "@lib/responseDownloadFormats/html/css/compiled";
import { Language } from "@lib/types/form-builder-types";

import { NextSteps } from "./NextSteps";

export interface HTMLProps {
  language: Language;
  formTitle: string;
  formResponse: string;
  reviewItems: ReviewSection[];
  securityAttribute: SecurityAttribute;
  startSectionTitle: string;
}

export const DownloadProgressHtml = ({
  language,
  formTitle,
  formResponse,
  reviewItems,
  securityAttribute,
  startSectionTitle,
}: HTMLProps) => {
  const formData = JSON.stringify({
    data: formResponse,
  });

  return (
    <html lang={language}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{formTitle}</title>
        <script
          type="application/json"
          id="form-data"
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{
            __html: formData,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: css }}></style>
      </head>
      <body>
        <div id="skip-link-container">
          <a href="#content" id="skip-link">
            Skip to main content
          </a>
        </div>
        <div id="page-container">
          <main id="content">
            <div className="mt-14" />
            <Fip language="en" />
            <div className="mt-14" />
            <h1>{formTitle}</h1>
            <NextSteps securityAttribute={securityAttribute} language={language} />
            <ReviewList
              reviewItems={reviewItems}
              language={language}
              startSectionTitle={startSectionTitle}
            />
          </main>
        </div>
      </body>
    </html>
  );
};
