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
  // submissionID: string;
  responseID: string;
  createdAt: number;
}

const HTMLDownload: NextPageWithLayout<HTMLDownloadProps> = ({
  formTemplate,
  formResponse,
  confirmReceiptCode,
  // submissionID,
  responseID,
  createdAt,
}: HTMLDownloadProps) => {
  const CopyToClipboardScript = React.createElement("script", {
    dangerouslySetInnerHTML: {
      // eslint-disable-next-line no-useless-escape
      __html: `
      // From: https://www.npmjs.com/package/copy-text-to-clipboard
      function copyTextToClipboard(input, {target = document.body} = {}) {
        const element = document.createElement('textarea');
        const previouslyFocusedElement = document.activeElement;
      
        element.value = input;
      
        // Prevent keyboard from showing on mobile
        element.setAttribute('readonly', '');
      
        element.style.contain = 'strict';
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.fontSize = '12pt'; // Prevent zooming on iOS
      
        const selection = document.getSelection();
        const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0);
      
        target.append(element);
        element.select();
      
        // Explicit selection workaround for iOS
        element.selectionStart = 0;
        element.selectionEnd = input.length;
      
        let isSuccess = false;
        try {
          isSuccess = document.execCommand('copy');
        } catch(e) {}
      
        element.remove();
      
        if (originalRange) {
          selection.removeAllRanges();
          selection.addRange(originalRange);
        }
      
        // Get the focus back on the previously focused element, if any
        if (previouslyFocusedElement) {
          previouslyFocusedElement.focus();
        }
      
        return isSuccess;
      }

      // Row layout question element height depends on content. Give a consistent height using JS.
      document.addEventListener("DOMContentLoaded", function() {
        function getMaxElementsHeight(el) {
          var elList = Array.from(el);
          var elHeights = elList.map(item => item.offsetHeight);
          var maxHeight = Math.max(...elHeights);
          var remHeight = parseFloat(getComputedStyle(document.documentElement).fontSize);
          if (maxHeight <= remHeight) {
            return 1;
          }
          var maxHeightAsRem = Math.ceil(maxHeight / remHeight);
          return maxHeightAsRem;
        }
        function setElementsHeight(el, height) {
          var elList = Array.from(el);
          elList.forEach(item => item.style.height = height + "rem");
        }
        var tableRowEnEl = document.querySelectorAll("#responseTableRowEn > div > dt");
        var tableRowFrEl = document.querySelectorAll("#responseTableRowFr > div > dt");
        var heightRowEn = getMaxElementsHeight(tableRowEnEl);
        var heightRowFr = getMaxElementsHeight(tableRowFrEl);
        setElementsHeight(tableRowEnEl, heightRowEn);
        setElementsHeight(tableRowEnEl, heightRowFr);
      });
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
        // submissionID={submissionID}
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
        // submissionID={submissionID}
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
