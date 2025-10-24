import { FormRecord, SecurityAttribute } from "@lib/types";
import React from "react";
import { ClipboardJSScript, UpdateDLStylesScript } from "../scripts";
import { ProtectedWarning } from "./ProtectedWarning";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
import { ResponseSection } from "./ResponseSection";
import { css } from "../css/compiled";
import { Submission } from "../../types";
import { TFunction } from "i18next";

interface HTMLDownloadProps {
  response: Submission;
  formRecord: FormRecord;
  confirmationCode: string;
  responseID: string;
  createdAt: number;
  securityAttribute: SecurityAttribute;
  t: TFunction<string | string[], undefined>;
}

export const ResponseHtml = ({
  response,
  formRecord,
  confirmationCode,
  responseID,
  createdAt,
  securityAttribute,
  t,
}: HTMLDownloadProps) => {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{`${formRecord.form.titleEn} - ${formRecord.form.titleFr}`}</title>
        <style dangerouslySetInnerHTML={{ __html: css }}></style>
      </head>
      <body className="gcds-page flex h-full flex-col bg-white">
        <div id="skip-link-container">
          <a href="#content" id="skip-link">
            Skip to main content
          </a>
        </div>
        <div>
          <main id="content">
            <h1 className="sr-only">{`${formRecord.form.titleEn} - ${formRecord.form.titleFr}`}</h1>
            <div className="mt-14" />
            <div className="container-xl mx-auto px-[var(--gcds-spacing-225)] tablet:px-[var(--gcds-spacing-600)] laptop:px-0">
              <ProtectedWarning securityAttribute={securityAttribute} lang="en" t={t} />
            </div>
            <div className="mt-14" />
            <GcdsHeader language={"en"} skipLink={false} showLanguageToggle={false} pathname="" />

            <div className="container-xl mx-auto px-[var(--gcds-spacing-225)] tablet:px-[var(--gcds-spacing-600)] laptop:px-0">
              <ResponseSection
                formRecord={formRecord}
                confirmReceiptCode={confirmationCode}
                lang={"en"}
                responseID={responseID}
                submissionDate={createdAt}
                formResponse={response}
                t={t}
              />
            </div>

            <div className="mt-20" />
            <div lang="fr">
              <div className="mt-14" />
              <div className="container-xl mx-auto px-[var(--gcds-spacing-225)] tablet:px-[var(--gcds-spacing-600)] laptop:px-0">
                <ProtectedWarning securityAttribute={securityAttribute} lang="fr" t={t} />
              </div>
              <div className="mt-14" />
              <GcdsHeader language={"fr"} skipLink={false} showLanguageToggle={false} pathname="" />
              <div className="gc-formview container-xl mx-auto px-[var(--gcds-spacing-225)] tablet:px-[var(--gcds-spacing-600)] laptop:px-0">
                <ResponseSection
                  formRecord={formRecord}
                  confirmReceiptCode={confirmationCode}
                  lang={"fr"}
                  responseID={responseID}
                  submissionDate={createdAt}
                  formResponse={response}
                  t={t}
                />
              </div>
            </div>
          </main>
        </div>

        {ClipboardJSScript}

        {UpdateDLStylesScript}
      </body>
    </html>
  );
};
