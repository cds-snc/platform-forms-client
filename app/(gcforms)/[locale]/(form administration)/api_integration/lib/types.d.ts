export type PrivateApiKey = {
  keyId: string;
  key: string;
  userId: string;
  formId: string;
};

export type NewFormSubmission = {
  name: string;
  createdAt: number;
};

export type EncryptedFormSubmission = {
  encryptedResponses: string;
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
  name: string;
  confirmationCode: string;
};

export enum FormSubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export type FormSubmissionProblem = {
  contactEmail: string;
  description: string;
  preferredLanguage: string;
};

export enum SubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export enum AttachmentScanStatus {
  NoThreatsFound = "NoThreatsFound",
  ThreatsFound = "ThreatsFound",
  Unsupported = "Unsupported",
  Failed = "Failed",
}

type CompleteAttachment = {
  id: string;
  name: string;
  path: string;
  scanStatus: AttachmentScanStatus;
  downloadLink: string;
};

export type FormSubmission = {
  createdAt: number;
  status: SubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
  attachments?: CompleteAttachment[];
};
