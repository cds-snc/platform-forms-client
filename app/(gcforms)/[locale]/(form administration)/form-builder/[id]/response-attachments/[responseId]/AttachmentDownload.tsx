"use client";

import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import { addResponseAttachmentsToZip } from "@lib/responseDownloadFormats/attachments";
import type { ResponseAttachment } from "@lib/responseDownloadFormats/types";
import { GcFormsIcon } from "@clientComponents/forms/SubmitProgress/GCFormsIcon";
import { ProgressBar } from "@clientComponents/forms/SubmitProgress/ProgressBar";

export const AttachmentDownload = ({
  responseId,
  attachments,
  downloadingTitle,
  unavailableTitle,
  unavailableMessage,
  progressLabel,
  preparingLabel,
  completedLabel,
}: {
  responseId: string;
  attachments: ResponseAttachment[];
  downloadingTitle: string;
  unavailableTitle: string;
  unavailableMessage: string;
  progressLabel: string;
  preparingLabel: string;
  completedLabel: string;
}) => {
  const [downloadError, setDownloadError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedAttachments, setDownloadedAttachments] = useState(0);
  const [status, setStatus] = useState<"downloading" | "preparing" | "completed">("downloading");
  const downloadStarted = useRef(false);

  useEffect(() => {
    if (downloadStarted.current) return;
    downloadStarted.current = true;

    const downloadAttachments = async () => {
      try {
        const zip = new JSZip();
        await addResponseAttachmentsToZip(
          zip,
          [{ responseId, attachments }],
          true,
          (completed, total) => {
            setDownloadedAttachments(completed);
            setProgress(Math.round((completed / total) * 80));
          }
        );
        setStatus("preparing");
        const blob = await zip.generateAsync({ type: "blob", streamFiles: true }, (metadata) =>
          setProgress(80 + Math.round(metadata.percent * 0.2))
        );
        const href = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.download = `${responseId}-attachments.zip`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(href);
        setProgress(100);
        setStatus("completed");
      } catch {
        setDownloadError(true);
      }
    };

    downloadAttachments();
  }, [attachments, responseId]);

  return (
    <main className="laptop:px-0 px-4 pt-4 pb-12">
      <h1 className="mb-8">{downloadError ? unavailableTitle : downloadingTitle}</h1>
      {!downloadError && (
        <div
          aria-live="polite"
          role="status"
          className="flex w-full max-w-3xl items-center justify-center gap-6 rounded-md border border-gray-300 bg-white p-8"
        >
          <GcFormsIcon />
          <div className="w-full max-w-md">
            <p className="mb-3 font-bold">
              {status === "downloading"
                ? progressLabel.replace("{{current}}", String(downloadedAttachments))
                : status === "preparing"
                  ? preparingLabel
                  : completedLabel}
            </p>
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}
      {downloadError && <p>{unavailableMessage}</p>}
    </main>
  );
};
