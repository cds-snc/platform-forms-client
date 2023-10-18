import { FormProperties, Responses, SecurityAttribute } from "@lib/types";
import React from "react";
import { CopyToClipboardScript } from "./scripts";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { ResponseSection } from "./ResponseSection";
import { css } from "./styles";

interface HTMLDownloadProps {
  form: FormProperties;
  response: Responses;
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
        <h1 className="sr-only">{`${form.titleEn} - ${form.titleFr}`}</h1>
        <ProtectedWarning securityAttribute={securityAttribute} lang="en" />
        <Fip language="en" />
        <ResponseSection
          confirmReceiptCode={confirmationCode}
          lang={"en"}
          responseID={responseID}
          // submissionID={submissionID}
          submissionDate={createdAt}
          formTemplate={form}
          formResponse={response}
        />
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
      </body>
      {CopyToClipboardScript}
    </html>
  );
};
