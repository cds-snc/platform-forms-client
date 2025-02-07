import React from "react";

import { type SecurityAttribute } from "@lib/types";
import { type ReviewSection } from "@clientComponents/forms/Review/helpers";
import { type Language } from "@lib/types/form-builder-types";

import Fip from "@lib/responseDownloadFormats/html/components/Fip";
import { css } from "@lib/responseDownloadFormats/html/css/compiled";
import { NextSteps } from "./NextSteps";
import { ReviewList } from "@clientComponents/forms/Review/ReviewList";
import { InProgressBadge } from "./InProgressBadge";

export interface HTMLProps {
  language: Language;
  formTitle: string;
  formId: string;
  formResponse: string;
  reviewItems: ReviewSection[];
  securityAttribute: SecurityAttribute;
  startSectionTitle: string;
  host?: string;
}

export const DownloadProgressHtml = ({
  language,
  formTitle,
  formId,
  formResponse,
  reviewItems,
  securityAttribute,
  startSectionTitle,
  host,
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
            <div className="mt-6" />
            <Fip
              language={language}
              showLangLink={false}
              className="mb-10 mt-0 border-b-4 border-blue-dark py-9"
            />
            <div>
              <div className="mb-14">
                <InProgressBadge language={language} />
              </div>
              <h1>{formTitle}</h1>
              <NextSteps
                language={language}
                host={host || ""}
                formId={formId}
                securityAttribute={securityAttribute}
              />
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
