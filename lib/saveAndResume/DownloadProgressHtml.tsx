import React from "react";

import { type SecurityAttribute } from "@lib/types";
import { type ReviewSection } from "@clientComponents/forms/Review/helpers";
import { type Language } from "@lib/types/form-builder-types";

import Fip from "@lib/responseDownloadFormats/html/components/Fip";
import { css } from "@lib/responseDownloadFormats/html/css/compiled";
import { NextSteps } from "./NextSteps";
import { ReviewList } from "@clientComponents/forms/Review/ReviewList";

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
            <Fip language={language} showLangLink={false} />
            <div className="mt-14">
              <h1>{formTitle}</h1>
              <NextSteps securityAttribute={securityAttribute} language={language} />
              <ReviewList
                reviewItems={reviewItems}
                language={language}
                startSectionTitle={startSectionTitle}
              />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};
