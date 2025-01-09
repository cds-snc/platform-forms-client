import { Response, Responses, PublicFormRecord } from "@lib/types";

export interface Submission {
  form: PublicFormRecord;
  responses: Responses;
}
export interface SubmissionRequestBody {
  [key: string]: Response;
}

export type SubmissionParsedRequest = {
  fields: Record<string, Response>;
  files: Record<string, ProcessedFile | ProcessedFile[]>;
};

export interface ProcessedFile {
  name: string;
  buffer: Buffer;
}
