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

export type FormSubmissionProblem = {
  contactEmail: string;
  description: string;
  preferredLanguage: string;
};

export const SubmissionStatus = {
  New: "New",
  Downloaded: "Downloaded",
  Confirmed: "Confirmed",
  Problem: "Problem",
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

type CompleteAttachment = {
  id: string;
  name: string;
  isPotentiallyMalicious: boolean;
  md5: string;
  downloadLink: string;
  renameTo?: string;
};

export type FormSubmission = {
  createdAt: number;
  status: SubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
  attachments?: CompleteAttachment[];
};
