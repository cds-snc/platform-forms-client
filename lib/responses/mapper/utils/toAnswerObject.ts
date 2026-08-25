import { FormElement, FormElementTypes } from "@gcforms/types";
import type { MappedAnswer } from "../types";
import { Response } from "@gcforms/types";

export const createAnswerObject = ({
  question,
  answer,
}: {
  question: FormElement;
  answer: MappedAnswer["answer"];
}): MappedAnswer => {
  return {
    type: String(question.type),
    questionId: question.id,
    questionEn: question.properties?.titleEn,
    questionFr: question.properties?.titleFr,
    answer,
    ...(question.type === FormElementTypes.formattedDate && {
      dateFormat: question.properties.dateFormat,
    }),
  };
};

/**
 * Create a fallback MappedAnswer used when a question definition is not
 * available or when the answer cannot be mapped. The fallback contains
 * placeholder titles and the JSON-stringified raw answer.
 */
export const createFallbackMappedAnswer = ({
  questionId = 0,
  rawAnswer,
}: {
  questionId?: number;
  rawAnswer: Response;
}): MappedAnswer => {
  return {
    type: "-",
    questionId,
    questionEn: "-",
    questionFr: "-",
    answer: JSON.stringify(rawAnswer),
  };
};
