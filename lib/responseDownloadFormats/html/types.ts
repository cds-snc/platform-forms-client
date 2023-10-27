import { ResponseSubmission } from "../types";

export interface TableProps {
  isRowTable?: boolean;
  lang?: string;
  responseID: string;
  submissionDate: number;
  formResponse: ResponseSubmission;
}
