import React, { ReactElement } from "react";
import { ResponseSection } from "./ResponseSection";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { NextPageWithLayout } from "@pages/_app";
import Head from "next/head";
import SkipLink from "@components/globals/SkipLink";
import Footer from "./Footer";
import { FormProperties, Responses } from "@lib/types";

interface HTMLDownloadProps {
  formTemplate: FormProperties;
  formResponse: Responses;
  confirmReceiptCode: string;
  submissionID: string;
  responseID: string;
  createdAt: number;
}

const HTMLDownload: NextPageWithLayout<HTMLDownloadProps> = ({
  formTemplate,
  formResponse,
  confirmReceiptCode,
  submissionID,
  responseID,
  createdAt,
}: HTMLDownloadProps) => {
  return (
    <>
      <div className="mt-14" />
      <ProtectedWarning lang="en" />
      <Fip language="en" />
      <div className="mt-14" />
      <ResponseSection
        confirmReceiptCode={confirmReceiptCode}
        lang={"en"}
        responseID={responseID}
        submissionID={submissionID}
        submissionDate={createdAt}
        formTemplate={formTemplate}
        formResponse={formResponse}
      />

      <div className="mt-20" />

      <ProtectedWarning lang="fr" />
      <Fip language="fr" />
      <div className="mt-14" />
      <ResponseSection
        confirmReceiptCode={confirmReceiptCode}
        lang={"fr"}
        responseID={responseID}
        submissionID={submissionID}
        submissionDate={createdAt}
        formTemplate={formTemplate}
        formResponse={formResponse}
      />
    </>
  );
};

HTMLDownload.getLayout = (page: ReactElement) => {
  return (
    <div className="flex flex-col h-full">
      <SkipLink />

      <div id="page-container">
        <main id="content">{page}</main>
      </div>
      <Footer />
    </div>
  );
};

export default HTMLDownload;
