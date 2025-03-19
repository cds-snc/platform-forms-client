import React from "react";

import { type HTMLProps } from "./types";
import Fip from "@lib/responseDownloadFormats/html/components/Fip";
import { css } from "@lib/responseDownloadFormats/html/css/compiled";
import { ReviewList } from "@clientComponents/forms/Review/ReviewList";
import { InProgressBadge } from "./InProgressBadge";
import { NextSteps } from "./NextSteps";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";

export const DownloadProgressHtml = ({
  language,
  formTitle,
  formId,
  formResponse,
  reviewItems,
  startSectionTitle,
  host,
}: HTMLProps) => {
  let formData;
  try {
    formData = JSON.stringify({
      data: formResponse,
    });
  } catch (err) {
    throw new Error(`Failed to stringify: ${(err as Error).message} `);
  }

  return (
    <html lang={language}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <meta name="host" content={host} />
        <meta name="formId" content={formId} />
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
              <GcdsH1>{formTitle}</GcdsH1>
              <NextSteps language={language} host={host || ""} formId={formId} />
              <div className="mb-10" data-testid="review-list">
                <ReviewList
                  reviewItems={reviewItems}
                  language={language}
                  startSectionTitle={startSectionTitle}
                />
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};
