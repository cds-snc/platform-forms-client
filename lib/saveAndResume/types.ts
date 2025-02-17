import { type ReviewSection } from "@clientComponents/forms/Review/helpers";
import { type Language } from "@lib/types/form-builder-types";

export interface HTMLProps {
  language: Language;
  host?: string;
  type: "confirm" | "progress";
  formTitle: string;
  formId: string;
  formResponse: string;
  reviewItems: ReviewSection[];
  startSectionTitle: string;
  submissionId?: string;
  submittedDate?: string;
}
