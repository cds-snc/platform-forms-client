import React, { ReactElement } from "react";
import { ResponseSection } from "./ResponseSection";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { NextPageWithLayout } from "@pages/_app";
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
  // Note: copy+paste from NPM Library https://www.npmjs.com/package/copy-text-to-clipboard
  const CopyToClipboardScript = React.createElement("script", {
    dangerouslySetInnerHTML: {
      // eslint-disable-next-line no-useless-escape
      __html: `function copyTextToClipboard(e,{target:t=document.body}={}){const n=document.createElement("textarea"),o=document.activeElement;n.value=e,n.setAttribute("readonly",""),n.style.contain="strict",n.style.position="absolute",n.style.left="-9999px",n.style.fontSize="12pt";const c=document.getSelection();let l=!1;0<c.rangeCount&&(l=c.getRangeAt(0)),t.append(n),n.select(),n.selectionStart=0,n.selectionEnd=e.length;let a=!1;try{a=document.execCommand("copy")}catch{}return n.remove(),l&&(c.removeAllRanges(),c.addRange(l)),o&&o.focus(),a}
      `,
    },
  });
  return (
    <>
      <h1 className="sr-only">{`${formTemplate.titleEn} - ${formTemplate.titleFr}`}</h1>
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
      {CopyToClipboardScript}
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
