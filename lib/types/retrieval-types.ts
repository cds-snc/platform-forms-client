import { Responses } from "./form-response-types";

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
  fileAttachments: { fileName: string }[];
  securityAttribute: string;
};
