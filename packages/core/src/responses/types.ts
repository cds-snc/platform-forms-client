import type { FormElement, Response } from "@gcforms/types";

export interface MappedAnswer {
  type: string;
  questionId: number;
  questionEn: string | undefined;
  questionFr: string | undefined;
  answer: string | Array<MappedAnswer[]>;
  [key: string]: string | number | Array<MappedAnswer[]> | undefined;
}

export type ResponseFilenameMapping = Map<
  string,
  { originalName: string; actualName: string; isPotentiallyMalicious: boolean }
>;

export type AnswerFormatter = (
  question: FormElement | undefined,
  answer: unknown,
  attachments?: ResponseFilenameMapping
) => string;

export type RawAnswers = Record<string, Response>;
