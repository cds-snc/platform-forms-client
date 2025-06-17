import { Response, Responses, PublicFormRecord } from "@lib/types";

export interface Submission {
  form: PublicFormRecord;
  responses: Responses;
}
export interface SubmissionRequestBody {
  [key: string]: Response;
}
