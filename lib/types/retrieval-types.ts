import { Responses } from "./form-response-types";
import { TypeOmit } from ".";

export interface BearerTokenPayload {
  formID: string;
}

export interface TemporaryTokenPayload {
  email: string;
  formID: string;
}

export type BearerResponse = {
  bearerToken: string;
};

export type VaultSubmission = {
  formID: string;
  submissionID: string;
  formSubmission: Responses;
  fileAttachments?: { fileName: string }[];
  securityAttribute: string;
  createdAt: Date;
  status: string;
  confirmationCode: string;
  responseID: string;
  retrieved: number;
};

export type VaultSubmissionList = TypeOmit<VaultSubmission, "formSubmission">;
