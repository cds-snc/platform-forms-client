import { Response, Responses, PublicFormRecord } from "@lib/types";

export interface Submission {
  form: PublicFormRecord;
  responses: Responses;
}
export interface SubmissionRequestBody {
  [key: string]: Response;
}

export type SignedURLMap = Record<string, PostSignedURL>;

type PostSignedURL = {
  url: string;
  fields: Record<string, string>;
};
