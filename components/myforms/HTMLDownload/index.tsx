import React, { ReactElement } from "react";
import { ResponseSection } from "./ResponseSection";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { NextPageWithLayout } from "@pages/_app";
import Head from "next/head";
import SkipLink from "@components/globals/SkipLink";
import Footer from "./Footer";

interface HTMLDownloadProps {
  formResponse: any; //TODO
  confirmReceiptCode: string;
}

const HTMLDownload: NextPageWithLayout<HTMLDownloadProps> = (props: HTMLDownloadProps) => {
  const { formResponse, confirmReceiptCode } = props;
  const {
    // id,
    responseNumber,
    submissionDate,
    questionsAnswersEn,
    questionsAnswersFr,
    titleEn,
    titleFr,
  } = formResponse;

  return (
    <>
      <div className="mt-14" />
      <ProtectedWarning lang="en" />
      <Fip language="en" />
      <div className="mt-14" />
      <ResponseSection
        confirmReceiptCode={confirmReceiptCode}
        lang={"en"}
        // id={id}
        responseNumber={responseNumber}
        submissionDate={submissionDate}
        title={titleEn}
        questionsAnswers={questionsAnswersEn}
      />

      <div className="mt-20" />

      <ProtectedWarning lang="fr" />
      <Fip language="fr" />
      <div className="mt-14" />
      <ResponseSection
        confirmReceiptCode={confirmReceiptCode}
        lang={"fr"}
        // id={id}
        responseNumber={responseNumber}
        submissionDate={submissionDate}
        title={titleFr}
        questionsAnswers={questionsAnswersFr}
      />
    </>
  );
};

HTMLDownload.getLayout = (page: ReactElement) => {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>

      <SkipLink />

      <div id="page-container">
        <main id="content">{page}</main>
      </div>
      <Footer />
    </div>
  );
};

export default HTMLDownload;
