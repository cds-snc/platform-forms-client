import { FormElement, type Response, type Responses } from "@lib/types";
import { ResponseFilenameMapping } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses-pilot/lib/processResponse";

export type ErrorListMessageContext = {
  question: string;
  language: string;
  t: (key: string, options?: Record<string, unknown>) => string;
};

export type SharedElementDefinition = {
  normalizeResponse?: (
    value: Response | Responses[],
    element: FormElement
  ) => Response | Responses[];
  answerToString?: (
    question: FormElement,
    answer: unknown,
    attachments?: ResponseFilenameMapping
  ) => string;
  getErrorListMessage?: (context: ErrorListMessageContext) => string;
};
