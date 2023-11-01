import { FormProperties, SecurityAttribute } from "@lib/types";
import React from "react";
import { CopyToClipboardScript } from "../scripts";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { ResponseSection } from "./ResponseSection";
import { css } from "../css/styles";
import { ResponseSubmission } from "../../types";

interface HTMLDownloadProps {
  form: FormProperties;
  response: ResponseSubmission;
  confirmationCode: string;
  // submissionID: string;
  responseID: string;
  createdAt: number;
  securityAttribute: SecurityAttribute;
}

export const ResponseHtml = ({
  form,
  response,
  confirmationCode,
  // submissionID,
  responseID,
  createdAt,
  securityAttribute,
}: HTMLDownloadProps) => {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{`${form.titleEn} - ${form.titleFr}`}</title>
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
            <h1 className="sr-only">{`${form.titleEn} - ${form.titleFr}`}</h1>
            <div className="mt-14" />
            <ProtectedWarning securityAttribute={securityAttribute} lang="en" />
            <Fip language="en" />
            <div className="mt-14" />
            <ResponseSection
              confirmReceiptCode={confirmationCode}
              lang={"en"}
              responseID={responseID}
              // submissionID={submissionID}
              submissionDate={createdAt}
              formTemplate={form}
              formResponse={response}
            />
            <div className="mt-20" />
            <div lang="fr">
              <ProtectedWarning securityAttribute={securityAttribute} lang="fr" />
              <Fip language="fr" />
              <div className="mt-14" />
              <ResponseSection
                confirmReceiptCode={confirmationCode}
                lang={"fr"}
                responseID={responseID}
                // submissionID={submissionID}
                submissionDate={createdAt}
                formTemplate={form}
                formResponse={response}
              />
            </div>
          </main>
        </div>
      </body>
      {CopyToClipboardScript}
    </html>
  );
};
