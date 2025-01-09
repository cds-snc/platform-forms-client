import { Responses } from "@lib/types";

export enum VaultStatus {
  NEW = "New",
  DOWNLOADED = "Downloaded",
  CONFIRMED = "Confirmed",
  PROBLEM = "Problem",
}

export type VaultSubmission = {
  formID: string;
  submissionID: string;
  formSubmission: Responses;
  fileAttachments?: { fileName: string }[];
  securityAttribute: string;
  createdAt: number;
  status: VaultStatus;
  confirmationCode: string;
  name: string;
  lastDownloadedBy: string;
  formSubmssionLanguage?: string;
  confirmedAt?: number;
  downloadedAt?: number;
  removedAt?: number;
};

export type VaultSubmissionOverview = {
  formID: string;
  name: string;
  createdAt: number;
  status: VaultStatus;
};

export type StartFromExclusiveResponse = {
  name: string;
  status: string;
  createdAt: number;
};
