"use client";
import Image from "next/image";
import { cn } from "@lib/utils";

import {
  HTML_DOWNLOAD_FOLDER,
  SOURCE_FOLDER,
  LOGS_FOLDER,
  RAW_RESPONSE_FOLDER,
  ATTACHMENTS_FOLDER,
  MALICIOUS_ATTACHMENTS_FOLDER,
} from "../../lib/constants";
import { useResponsesApp } from "../../context";
import { FormElement, FormElementTypes } from "@root/packages/types/src/form-types";

export const hasFileInputElement = ({ elements }: { elements?: FormElement[] }) => {
  // Helper function to recursively check for file input elements
  const checkForFileInput = (elements?: FormElement[]): boolean => {
    if (!elements) return false;

    return elements.some(
      (element) =>
        // Check if the current element is a file input
        element.type === FormElementTypes.fileInput ||
        // Check sub-elements if they exist
        (element.properties?.subElements && checkForFileInput(element.properties.subElements))
    );
  };

  return checkForFileInput(elements);
};

export const CsvDirectory = ({
  filename = "example.csv",
  showAttachments,
}: {
  filename: string;
  showAttachments?: boolean;
}) => {
  const { t } = useResponsesApp();
  return (
    <>
      <p className="mb-4 font-bold">{t("formatPage.previewCsvStructure")}</p>
      <DirectoryPreview>
        <DirectoryItem>
          <FileIcon />
          <Name name={filename} bold />
        </DirectoryItem>
        {showAttachments && <AttachmentsDirectory />}
        <SourceDirectory />
      </DirectoryPreview>
    </>
  );
};

export const HtmlDirectory = ({ showAttachments }: { showAttachments?: boolean }) => {
  const { t } = useResponsesApp();
  return (
    <>
      <p className="mb-4 font-bold">{t("formatPage.previewHtmlStructure")}</p>
      <DirectoryPreview>
        <DirectoryItem>
          <FolderIcon />
          <Name name={HTML_DOWNLOAD_FOLDER} bold />
        </DirectoryItem>
        {showAttachments && <AttachmentsDirectory />}
        <SourceDirectory />
      </DirectoryPreview>
    </>
  );
};

export const Name = ({ name, bold }: { name: string; bold?: boolean }) => {
  return <span className={bold ? "font-bold" : undefined}>{name}</span>;
};

export const FileIcon = () => {
  return (
    <Image
      src="/img/file-emoji.png"
      alt=""
      aria-hidden="true"
      width="20"
      height="20"
      className={cn("inline-block mr-2")}
    />
  );
};

export const FolderIcon = ({ level }: { level?: number }) => {
  let levelClass = "ml-0";

  switch (level) {
    case 1:
      levelClass = "ml-6";
      break;
  }

  return (
    <Image
      src="/img/folder-emoji.png"
      alt=""
      aria-hidden="true"
      width="20"
      height="20"
      className={cn("inline-block mr-2", levelClass)}
    />
  );
};

export const DirectoryItem = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const DirectoryPreview = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-fit rounded-md border-1 border-slate-500 bg-slate-50 p-4 pr-10">
      {children}
    </div>
  );
};

export const AttachmentsDirectory = () => {
  return (
    <div data-testid="attachments-directory">
      <DirectoryItem>
        <FolderIcon />
        <Name name={ATTACHMENTS_FOLDER} />
      </DirectoryItem>
      <DirectoryItem>
        <FolderIcon level={1} />
        {"/"} <Name name={MALICIOUS_ATTACHMENTS_FOLDER} />
      </DirectoryItem>
    </div>
  );
};

export const SourceDirectory = () => {
  return (
    <>
      <DirectoryItem>
        <FolderIcon />
        <Name name={SOURCE_FOLDER} />
      </DirectoryItem>
      <DirectoryItem>
        <FolderIcon level={1} />
        {"/"} <Name name={LOGS_FOLDER} />
      </DirectoryItem>
      <DirectoryItem>
        <FolderIcon level={1} />
        {"/"} <Name name={RAW_RESPONSE_FOLDER} />
      </DirectoryItem>
    </>
  );
};
