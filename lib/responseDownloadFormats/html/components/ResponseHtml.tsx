import { FormRecord, SecurityAttribute } from "@lib/types";
import React from "react";
import { ClipboardJSScript, UpdateDLStylesScript } from "../scripts";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { ResponseSection } from "./ResponseSection";
import { css } from "../css/compiled";
import { Submission } from "../../types";

interface HTMLDownloadProps {
  response: Submission;
  formRecord: FormRecord;
  confirmationCode: string;
  responseID: string;
  createdAt: number;
  securityAttribute: SecurityAttribute;
}

export const ResponseHtml = ({
  response,
  formRecord,
  confirmationCode,
  responseID,
  createdAt,
  securityAttribute,
}: HTMLDownloadProps) => {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{`${formRecord.form.titleEn} - ${formRecord.form.titleFr}`}</title>
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
            <h1 className="sr-only">{`${formRecord.form.titleEn} - ${formRecord.form.titleFr}`}</h1>
            <div className="mt-14" />
            <ProtectedWarning securityAttribute={securityAttribute} lang="en" />
            <Fip language="en" />
            <div className="mt-14" />
            <ResponseSection
              formRecord={formRecord}
              confirmReceiptCode={confirmationCode}
              lang={"en"}
              responseID={responseID}
              submissionDate={createdAt}
              formResponse={response}
            />
            <div className="mt-20" />
            <div lang="fr">
              <ProtectedWarning securityAttribute={securityAttribute} lang="fr" />
              <Fip language="fr" />
              <div className="mt-14" />
              <ResponseSection
                formRecord={formRecord}
                confirmReceiptCode={confirmationCode}
                lang={"fr"}
                responseID={responseID}
                submissionDate={createdAt}
                formResponse={response}
              />
            </div>
          </main>
        </div>

        {ClipboardJSScript}

        {UpdateDLStylesScript}
      </body>
    </html>
  );
};
