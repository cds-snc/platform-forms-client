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
};

export enum FormSubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export type FormSubmission = {
  createdAt: number;
  status: FormSubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
};

export type FormSubmissionProblem = {
  contactEmail: string;
  description: string;
  preferredLanguage: string;
};
