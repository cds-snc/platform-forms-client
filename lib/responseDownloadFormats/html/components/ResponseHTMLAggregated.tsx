import React from "react";
import { CopyToClipboardScript } from "../scripts";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { css } from "../css/compiled";
import { ColumnTable } from "./ColumnTable";
import { AggregatedTable } from "./AggregatedTable";
import { FormResponseSubmissions, Submission } from "@lib/responseDownloadFormats/types";

interface HTMLDownloadProps {
  lang: string;
  formResponseSubmissions: FormResponseSubmissions;
}

export const ResponseHtmlAggregated = ({
  lang = "en",
  formResponseSubmissions,
}: HTMLDownloadProps) => {
  // "questionEn" : "questionFr"
  const langKey = lang === "en" ? "En" : "Fr";

  const form = formResponseSubmissions.form;

  const confirmationCodes = formResponseSubmissions.submissions.map(
    (submission) => submission.confirmationCode
  );
  const submissions = formResponseSubmissions.submissions as Submission[];

  const headersForTable = [
    "Submission number / [fr]Submission number",
    "Submission date / [fr]Submission date",
    ...formResponseSubmissions.submissions[0].answers.map((answer) =>
      String(answer["question" + langKey])
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

            <h2>TODO: ResponseSection reuse with Confirmation codes</h2>
            {confirmationCodes && confirmationCodes.join(", ")}

            <h2>Form responses: combined table of selected responses</h2>
            <AggregatedTable headers={headersForTable} submissions={submissions} />

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
    </html>
  );
};
