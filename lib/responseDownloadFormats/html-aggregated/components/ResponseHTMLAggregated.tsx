import React from "react";
import { ClipboardJSScript } from "../../html/scripts";
import Fip from "../../html/components/Fip";
import { css } from "../../html/css/compiled";
import { ColumnTable } from "../../html/components/ColumnTable";
import { AggregatedTable } from "./AggregatedTable";
import { FormResponseSubmissions, Submission } from "@lib/responseDownloadFormats/types";
import { customTranslate, getProperty, orderLanguageStrings } from "@lib/i18nHelpers";
import { copyCodeToClipboardScript } from "../scripts";
import { TableHeader } from "./AggregatedTable";
import { CopyCodes } from "./CopyCodes";
import { ProtectedLevel } from "./ProtectedLevel";
import { formatDateTimeUTC, formatDateTimeUTCFr } from "@lib/utils/form-builder";

interface HTMLDownloadProps {
  lang: string;
  formResponseSubmissions: FormResponseSubmissions;
  host: string;
}

export const ResponseHtmlAggregated = ({
  lang = "en",
  formResponseSubmissions,
  host = "",
}: HTMLDownloadProps) => {
  const { t } = customTranslate("my-forms");
  const formRecord = formResponseSubmissions.formRecord;

  // Newline deliniated will work to paste multiple codes in the confirmation dialog.
  // Note: The "\r\n" delimiter may be OS dependent. If so use an actual newline with .join(`
  // `)
  const confirmationCodes = formResponseSubmissions.submissions
    .map((submission) => submission.confirmationCode)
    .join(`\r\n`);

  const submissions = formResponseSubmissions.submissions as Submission[];

  const headersForTable = [
    {
      title: orderLanguageStrings({
        stringEn: t("responseTemplate.responseNumber", { lng: "en" }),
        stringFr: t("responseTemplate.responseNumber", { lng: "fr" }),
        lang,
      }),
      type: "formData",
    },
    {
      title: orderLanguageStrings({
        stringEn: t("responseTemplate.submissionDate", { lng: "en" }),
        stringFr: t("responseTemplate.submissionDate", { lng: "fr" }),
        lang,
      }),
      type: "formData",
    },
    ...formResponseSubmissions.submissions[0].answers.map((answer) => {
      return {
        title: orderLanguageStrings({
          stringEn: answer.questionEn,
          stringFr: answer.questionFr,
          lang,
        }),
        type: answer.type,
      };
    }),
  ] as TableHeader[];

  const dateTime = lang === "en" ? formatDateTimeUTC(Date.now()) : formatDateTimeUTCFr(Date.now());

  return (
    <html lang={lang}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <title>{`${formRecord.form[getProperty("title", lang)]}`}</title>
        <style dangerouslySetInnerHTML={{ __html: css }}></style>
      </head>
      <body>
        <div id="skip-link-container">
          <a href="#main-header" id="skip-link">
            Skip to main content
          </a>
        </div>
        <div id="page-container">
          <main id="content">
            <Fip language="en" showLangLink={false} />

            <h1 id="main-header" className="mb-6 mt-14">{`${
              formRecord.form[getProperty("title", lang)]
            }`}</h1>

            <div className="mb-14 border-2 border-dashed border-black bg-slate-50 p-8">
              <div className="mb-4 flex justify-between">
                <h2>{t("responseAggregatedTemplate.officialReceipt", { lng: lang })}</h2>
                <ProtectedLevel
                  securityAttribute={formResponseSubmissions.formRecord.securityAttribute}
                  lang={lang}
                />
              </div>
              <p className="mb-4">
                <strong>{submissions.length}</strong>{" "}
                {`${t("responseAggregatedTemplate.responsesDownloaded", {
                  lng: lang,
                  count: submissions.length,
                })} ${dateTime}`}
              </p>
              <p className="mb-4">{t("responseAggregatedTemplate.needToVerify", { lng: lang })}</p>
              <p className="mb-8">{t("responseAggregatedTemplate.useTheCopy", { lng: lang })}</p>
              <CopyCodes
                host={host}
                confirmationCodes={confirmationCodes}
                formId={formResponseSubmissions.formRecord.id}
                lang={lang}
              />
            </div>

            <h2>{t("responseAggregatedTemplate.title", { lng: lang })}</h2>

            <div className="mt-14 overflow-x-auto">
              <AggregatedTable lang={lang} headers={headersForTable} submissions={submissions} />
            </div>

            <h2 className="sr-only">
              {t("responseAggregatedTemplate.dataList.title", { lng: lang })}
            </h2>
            {submissions &&
              submissions.map((submission) => {
                return (
                  <div key="" className="mt-32 break-before-page">
                    <h3 id={submission.id} tabIndex={-1}>
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
