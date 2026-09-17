"use client";

import JSZip from "jszip";
import { useEffect, useState } from "react";
import { addResponseAttachmentsToZip } from "@lib/responseDownloadFormats/attachments";
import type { ResponseAttachment } from "@lib/responseDownloadFormats/types";

export const AttachmentDownload = ({
  responseId,
  attachments,
  downloadingTitle,
  unavailableTitle,
  unavailableMessage,
}: {
  responseId: string;
  attachments: ResponseAttachment[];
  downloadingTitle: string;
  unavailableTitle: string;
  unavailableMessage: string;
}) => {
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    const downloadAttachments = async () => {
      try {
        const zip = new JSZip();
        await addResponseAttachmentsToZip(zip, [{ responseId, attachments }], true);
        const blob = await zip.generateAsync({ type: "blob", streamFiles: true });
        const href = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.download = `${responseId}-attachments.zip`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(href);
      } catch {
        setDownloadError(true);
      }
    };

    downloadAttachments();
  }, [attachments, responseId]);

  return (
    <main>
      <h1>{downloadError ? unavailableTitle : downloadingTitle}</h1>
      {downloadError && <p>{unavailableMessage}</p>}
    </main>
  );
};
