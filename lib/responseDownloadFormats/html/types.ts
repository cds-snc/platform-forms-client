import { FormRecord } from "@root/lib/types";
import { Submission } from "../types";
import { Language } from "@root/lib/types/form-builder-types";

export interface TableProps {
  isRowTable?: boolean;
  lang?: Language;
  responseID: string;
  submissionDate: number;
  submission: Submission;
  formRecord: FormRecord;
}
