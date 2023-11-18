import React from "react";
import { ClipboardJSScript } from "../../html/scripts";
import { ProtectedWarning } from "../../html/components/ProtectedWarning";
import Fip from "../../html/components/Fip";
import { css } from "../../html/css/compiled";
import { ColumnTable } from "../../html/components/ColumnTable";
import { AggregatedTable } from "./AggregatedTable";
import { FormResponseSubmissions, Submission } from "@lib/responseDownloadFormats/types";
import {
  customTranslate,
  getProperty,
  orderLangugeStrings,
} from "@lib/responseDownloadFormats/helpers";
import { copyCodeToClipboardScript } from "../scripts";
import { TableHeader } from "./AggregatedTable";

interface HTMLDownloadProps {
  lang: string;
  formResponseSubmissions: FormResponseSubmissions;
}

export const ResponseHtmlAggregated = ({
  lang = "en",
  formResponseSubmissions,
}: HTMLDownloadProps) => {
  const { t } = customTranslate("my-forms");

  // Used by copy code script that expects Ids set with lang for user messages
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
    {
      title: orderLangugeStrings({
        stringEn: t("responseTemplate.responseNumber", { lng: "en" }),
        stringFr: t("responseTemplate.responseNumber", { lng: "fr" }),
        lang,
      }),
      type: "formData",
    },
    {
      title: orderLangugeStrings({
        stringEn: t("responseTemplate.submissionDate", { lng: "en" }),
        stringFr: t("responseTemplate.submissionDate", { lng: "fr" }),
        lang,
      }),
      type: "formData",
    },
    ...formResponseSubmissions.submissions[0].answers.map((answer) => {
      return {
        title: orderLangugeStrings({
          stringEn: answer.questionEn,
          stringFr: answer.questionFr,
          lang,
        }),
        type: answer.type,
      };
    }),
  ] as TableHeader[];

  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{`${form[getProperty("title", lang)]}`}</title>
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
            <Fip language="en" showLangLink={false} />
            <ProtectedWarning securityAttribute={form.securityAttribute} lang={lang} />
            <h1 className="mt-14">{`${form[getProperty("title", lang)]}`}</h1>

            <h2>{t("responseAggregatedTemplate.title", { lng: lang })}</h2>

            <h3 className="mt-14">
              {t("responseAggregatedTemplate.copyCodes.title", { lng: lang })}
            </h3>
            <p className="mt-8">
              {t("responseAggregatedTemplate.copyCodes.description", { lng: lang })}
            </p>
            <div className="mt-8 mb-14">
              <button
                id={`copyCodeButton${capitalizedLang}`}
                className="gc-button--blue"
                type="button"
                aria-labelledby={`confirmReceiptInfo${capitalizedLang}`}
                data-clipboard-text={confirmationCodes}
              >
                {t("responseAggregatedTemplate.copyCodes.copyButton", { lng: lang })}
              </button>
              <span
                id={`copyCodeOutput${capitalizedLang}`}
                aria-live="polite"
                className="ml-8 hidden text-green"
              ></span>
            </div>

            <div className="mt-14 overflow-x-auto">
              <AggregatedTable lang={lang} headers={headersForTable} submissions={submissions} />
            </div>

            <h2 className="sr-only">
              {t("responseAggregatedTemplate.dataList.title", { lng: lang })}
            </h2>
            {submissions &&
              submissions.map((submission) => {
                return (
                  <div key="" className="break-before-page">
                    <h3 className="mt-20">
                      {t("responseAggregatedTemplate.dataList.formResponse", { lng: lang })}{" "}
                      {submission.id}
                    </h3>
                    <ColumnTable
                      responseID={submission.id}
                      submissionDate={submission.createdAt}
                      submission={submission}
                      lang={lang}
                    />
                  </div>
                );
              })}
          </main>
        </div>

        {ClipboardJSScript}

        {copyCodeToClipboardScript(lang)}
      </body>
    </html>
  );
};
