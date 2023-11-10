import React from "react";
import { CopyToClipboardScript, copyCodeAndResponseFromTableToClipboardScript } from "../scripts";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { css } from "../css/compiled";
import { ColumnTable } from "./ColumnTable";
import { AggregatedTable } from "./AggregatedTable";
import { FormResponseSubmissions, Submission } from "@lib/responseDownloadFormats/types";
import { customTranslate } from "@lib/responseDownloadFormats/helpers";

interface HTMLDownloadProps {
  lang: string;
  formResponseSubmissions: FormResponseSubmissions;
}

export const ResponseHtmlAggregated = ({
  lang = "en",
  formResponseSubmissions,
}: HTMLDownloadProps) => {
  const { t } = customTranslate("my-forms");
  const capitalizedLang = lang === "en" ? "En" : "Fr";

  const form = formResponseSubmissions.form;

  // Newline deliniated will work to paste multiple codes in the confirmation dialog.
  // Note: The "\r\n" delimiter may be OS dependent. If so use an actual newline with .join(`
  // `)
  const confirmationCodes = formResponseSubmissions.submissions
    .map((submission) => submission.confirmationCode)
    .join(`\r\n`);

  const submissions = formResponseSubmissions.submissions as Submission[];

  const headersForTable = [
    "Submission number / [fr]Submission number",
    "Submission date / [fr]Submission date",
    ...formResponseSubmissions.submissions[0].answers.map((answer) =>
      String(answer["question" + capitalizedLang])
    ),
  ];

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
            <ProtectedWarning securityAttribute={form.securityAttribute} lang="en" />
            <Fip language="en" />
            <div className="mt-14" />

            <h3 id={`rowTable${capitalizedLang}`} className="gc-h2 mt-20" tabIndex={-1}>
              {t("responseTemplate.rowTable", { lng: lang })}
            </h3>
            <p className="mt-8">{t("responseTemplate.rowTableInfo", { lng: lang })}</p>
            <div className="mb-8 mt-4">
              <button
                id={`copyResponseButton${capitalizedLang}`}
                aria-labelledby={`copyResponseLabel${capitalizedLang}`}
                className="gc-button--blue"
                type="button"
                data-clipboard-text=""
              >
                {t("responseTemplate.copyResponse", { lng: lang })}
              </button>
              <span
                id={`copyResponseOutput${capitalizedLang}`}
                aria-live="polite"
                className="ml-8 hidden text-green"
              ></span>
            </div>

            <h2>TODO: ResponseSection reuse with Confirmation codes</h2>
            <div className="mb-32 mt-4">
              <button
                id={`copyCodeButton${capitalizedLang}`}
                className="gc-button--blue"
                type="button"
                aria-labelledby={`confirmReceiptInfo${capitalizedLang}`}
                data-clipboard-text={confirmationCodes}
              >
                {t("responseTemplate.copyCode", { lng: lang })}
              </button>
              <span
                id={`copyCodeOutput${capitalizedLang}`}
                aria-live="polite"
                className="ml-8 hidden text-green"
              ></span>
            </div>

            <h2>Form responses: combined table of selected responses</h2>
            <AggregatedTable lang={lang} headers={headersForTable} submissions={submissions} />

            {submissions &&
              submissions.map((submission) => {
                return (
                  <>
                    <h2>Form Response: {submission.id}</h2>
                    <ColumnTable
                      responseID={submission.id}
                      submissionDate={submission.createdAt}
                      submission={submission}
                      lang={"en"}
                    />
                  </>
                );
              })}
          </main>
        </div>
      </body>
      {CopyToClipboardScript}

      {copyCodeAndResponseFromTableToClipboardScript(lang)}
    </html>
  );
};
