import { Responses } from "./form-response-types";
import { TypeOmit } from ".";

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

export type VaultSubmissionList = TypeOmit<
  VaultSubmission,
  "formSubmission" | "submissionID" | "confirmationCode"
>;

export enum VaultStatus {
  NEW = "New",
  DOWNLOADED = "Downloaded",
  CONFIRMED = "Confirmed",
  PROBLEM = "Problem",
}
