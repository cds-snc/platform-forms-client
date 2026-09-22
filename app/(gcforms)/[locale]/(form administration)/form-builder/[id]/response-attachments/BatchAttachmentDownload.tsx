"use client";

/* eslint-disable no-await-in-loop */

import JSZip from "jszip";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@clientComponents/globals";
import { ProgressBar } from "@clientComponents/forms/SubmitProgress/ProgressBar";
import { CancelIcon, CircleCheckIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";

const MAX_LINKS = 40;
const CONCURRENT_DOWNLOADS = 4;

type LinkStatus = "waiting" | "downloading" | "completed" | "failed";

type BatchLink = {
  url: string;
  status: LinkStatus;
};

const safePathSegment = (value: string, fallback: string) => {
  const segment = value
    .replace(/[\\/\0]/g, "_")
    .replace(/^\.+$/, "_")
    .trim();
  return segment || fallback;
};

const parseLinks = (value: string) =>
  [
    ...new Set(
      value
        .split(/\s+/)
        .map((link) => link.trim())
        .filter(Boolean)
    ),
  ]
    .filter((link) => {
      try {
        const url = new URL(link);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    })
    .slice(0, MAX_LINKS);

const sourceIdFromUrl = (url: string, index: number) => {
  try {
    const pathParts = new URL(url).pathname.split("/").filter(Boolean);
    return safePathSegment(decodeURIComponent(pathParts.at(-1) ?? ""), `source-${index + 1}`);
  } catch {
    return `source-${index + 1}`;
  }
};

const filenameFromUrl = (url: string, index: number) => {
  try {
    const pathParts = new URL(url).pathname.split("/").filter(Boolean);
    return safePathSegment(decodeURIComponent(pathParts.at(-1) ?? ""), `attachment-${index + 1}`);
  } catch {
    return `attachment-${index + 1}`;
  }
};

const archivePath = (sourceDirectory: string, filename: string) =>
  `${sourceDirectory}/${filename
    .split("/")
    .map((part, index) => safePathSegment(part, `file-${index + 1}`))
    .join("/")}`;

export const BatchAttachmentDownload = () => {
  const { t } = useTranslation("my-forms");
  const title = t("responseTemplate.attachmentsBatchTitle");
  const inputLabel = t("responseTemplate.attachmentsInputLabel");
  const inputHint = t("responseTemplate.attachmentsInputHint");
  const downloadLabel = t("responseTemplate.downloadAttachments");
  const progressLabel = t("responseTemplate.attachmentsProgress");
  const preparingLabel = t("responseTemplate.attachmentsPreparing");
  const completedLabel = t("responseTemplate.attachmentsComplete");
  const failedLabel = t("responseTemplate.attachmentsFailed");
  const emptyLinksMessage = t("responseTemplate.attachmentsEmptyLinks");
  const [linkText, setLinkText] = useState("");
  const [batchLinks, setBatchLinks] = useState<BatchLink[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "downloading" | "preparing" | "completed">(
    "waiting"
  );
  const [error, setError] = useState<string | null>(null);
  const progressSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (phase === "downloading" && batchLinks.length > 0) {
      progressSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [batchLinks.length, phase]);

  const downloadBatch = async (event: FormEvent) => {
    event.preventDefault();
    const links = parseLinks(linkText);
    if (!links.length) {
      setError(emptyLinksMessage);
      return;
    }

    setError(null);
    setBatchLinks(links.map((url) => ({ url, status: "waiting" })));
    setCompleted(0);
    setProgress(0);
    setPhase("downloading");

    const zip = new JSZip();
    let nextIndex = 0;
    let successfulDownloads = 0;
    const sourceCounts = new Map<string, number>();

    const downloadNext = async () => {
      while (nextIndex < links.length) {
        const index = nextIndex++;
        const url = links[index];
        setBatchLinks((current) =>
          current.map((link, linkIndex) =>
            linkIndex === index ? { ...link, status: "downloading" } : link
          )
        );

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Download failed with status ${response.status}`);

          const blob = await response.blob();
          const baseSourceId = sourceIdFromUrl(url, index);
          const sourceCount = sourceCounts.get(baseSourceId) ?? 0;
          sourceCounts.set(baseSourceId, sourceCount + 1);
          const sourceId = sourceCount ? `${baseSourceId}-${sourceCount + 1}` : baseSourceId;
          const sourceDirectory = `attachments/${sourceId}`;

          try {
            const sourceZip = await JSZip.loadAsync(blob);
            const files = Object.values(sourceZip.files).filter((file) => !file.dir);
            if (!files.length) throw new Error("Empty archive");
            await Promise.all(
              files.map(async (file) => {
                zip.file(archivePath(sourceDirectory, file.name), await file.async("blob"));
              })
            );
          } catch {
            zip.file(`${sourceDirectory}/${filenameFromUrl(url, index)}`, blob);
          }

          successfulDownloads += 1;
          setCompleted(successfulDownloads);
          setProgress(Math.round((successfulDownloads / links.length) * 80));
          setBatchLinks((current) =>
            current.map((link, linkIndex) =>
              linkIndex === index ? { ...link, status: "completed" } : link
            )
          );
        } catch {
          setBatchLinks((current) =>
            current.map((link, linkIndex) =>
              linkIndex === index ? { ...link, status: "failed" } : link
            )
          );
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENT_DOWNLOADS, links.length) }, downloadNext)
    );

    if (!successfulDownloads) {
      setError(emptyLinksMessage);
      setPhase("waiting");
      return;
    }

    setPhase("preparing");
    const archiveBlob = await zip.generateAsync({ type: "blob", streamFiles: true }, (metadata) =>
      setProgress(80 + Math.round(metadata.percent * 0.2))
    );
    const href = window.URL.createObjectURL(archiveBlob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "attachments.zip";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(href);
    setProgress(100);
    setPhase("completed");
  };

  return (
    <main className="laptop:px-0 px-4 pt-4 pb-12">
      <h1 className="mb-8">{title}</h1>
      <form onSubmit={downloadBatch} className="mb-8 max-w-3xl">
        <label htmlFor="attachment-links" className="mb-2 block font-bold">
          {inputLabel}
        </label>
        <textarea
          id="attachment-links"
          value={linkText}
          onChange={(event) => setLinkText(event.target.value)}
          rows={10}
          className="mb-2 block w-full rounded-md border border-gray-500 p-3 font-mono text-sm"
          aria-describedby="attachment-links-hint"
        />
        <p id="attachment-links-hint" className="mb-4 text-sm">
          {inputHint.replace("{{limit}}", String(MAX_LINKS))}
        </p>
        <Button theme="primary" type="submit" disabled={phase === "downloading"}>
          {downloadLabel}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mb-6 max-w-3xl">
          {error}
        </p>
      )}
      {batchLinks.length > 0 && (
        <section
          ref={progressSectionRef}
          aria-live="polite"
          className="w-full max-w-3xl rounded-md border border-gray-300 bg-white p-8"
        >
          <p className="mb-3 font-bold">
            {phase === "downloading"
              ? progressLabel.replace("{{current}}", String(completed))
              : phase === "preparing"
                ? preparingLabel
                : completedLabel}
          </p>
          <ProgressBar progress={progress} />
          <ul className="mt-6 list-none space-y-2 p-0 text-left text-sm">
            {batchLinks.map((link) => (
              <li key={link.url} className="flex items-start gap-2 break-all">
                {link.status === "completed" ? (
                  <CircleCheckIcon className="size-7 shrink-0 fill-green-700" />
                ) : link.status === "failed" ? (
                  <CancelIcon className="size-7 shrink-0 fill-slate-500" />
                ) : (
                  <span aria-hidden="true">…</span>
                )}
                <span>
                  {link.status === "failed" ? `${failedLabel}: ` : ""}
                  {link.url}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};
