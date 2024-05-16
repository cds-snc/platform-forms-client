"use client";
import { DownloadIcon } from "@serverComponents/icons";
import { logMessage } from "@lib/logger";
import React from "react";
import { useTranslation } from "@i18n/client";
import { getSubmissionsByFormat } from "../actions";
import { DownloadFormat, HtmlResponse } from "@lib/responseDownloadFormats/types";
import { Language } from "@lib/types/form-builder-types";
import { usePathname } from "next/navigation";

export const DownloadSingleButton = ({
  id,
  formId,
  responseId,
  setDownloadError,
  onDownloadSuccess,
  ariaLabelledBy,
}: {
  id: string;
  formId: string;
  responseId: string;
  setDownloadError: (downloadError: boolean) => void;
  onDownloadSuccess: () => void;
  ariaLabelledBy: string;
}) => {
  const { t, i18n } = useTranslation("form-builder-responses");
  const pathname = usePathname();

  const handleDownload = async () => {
    try {
      const submissionHtml = (await getSubmissionsByFormat({
        formID: formId,
        ids: [responseId],
        format: DownloadFormat.HTML,
        lang: i18n.language as Language,
        revalidate: pathname.includes("new"),
      })) as HtmlResponse | { error: string };

      if (Array.isArray(submissionHtml)) {
        const interval = 200;
        const submission = submissionHtml[0];
        const fileName = `${submission.id}.html`;
        const href = window.URL.createObjectURL(new Blob([submission.html]));
        const anchorElement = document.createElement("a");
        anchorElement.href = href;
        anchorElement.download = fileName;
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);

        setTimeout(() => {
          onDownloadSuccess();
        }, interval);
      } else {
        throw new Error(submissionHtml.error);
      }
    } catch (err) {
      logMessage.error(err as Error);
      setDownloadError(true);
    }
  };

  return (
    <button
      id={id}
      onClick={handleDownload}
      className="rounded border-2 border-white active:border-blue-focus"
      aria-labelledby={`${id} ${ariaLabelledBy}`}
    >
      <DownloadIcon className="inline-block scale-50" />
      <span className="sr-only">{t("downloadResponsesTable.header.download")}</span>
    </button>
  );
};
