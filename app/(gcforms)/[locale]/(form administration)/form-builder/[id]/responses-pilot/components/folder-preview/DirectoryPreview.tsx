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

export const CsvDirectory = ({ filename = "example.csv" }: { filename: string }) => {
  return (
    <DirectoryPreview>
      <DirectoryItem>
        <FileIcon />
        <Name name={filename} bold />
      </DirectoryItem>
      <AttachmentsDirectory />
      <SourceDirectory />
    </DirectoryPreview>
  );
};

export const HtmlDirectory = () => {
  return (
    <DirectoryPreview>
      <DirectoryItem>
        <FolderIcon />
        <Name name={HTML_DOWNLOAD_FOLDER} bold />
      </DirectoryItem>
      <AttachmentsDirectory />
      <SourceDirectory />
    </DirectoryPreview>
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
    <div className="bg-slate-50 border-slate-500 border-1 rounded-md p-4 pr-10 w-fit">
      {children}
    </div>
  );
};

export const AttachmentsDirectory = () => {
  return (
    <>
      <DirectoryItem>
        <FolderIcon />
        <Name name={ATTACHMENTS_FOLDER} />
      </DirectoryItem>
      <DirectoryItem>
        <FolderIcon level={1} />
        {"/"} <Name name={MALICIOUS_ATTACHMENTS_FOLDER} />
      </DirectoryItem>
    </>
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
