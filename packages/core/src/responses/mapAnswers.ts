import { FormElement, FormElementTypes, FormProperties, Response } from "@gcforms/types";
import { createAnswerObject, createFallbackMappedAnswer } from "./toAnswerObject";
import { getAnswerAsString } from "./toString";
import type { AnswerFormatter, MappedAnswer, RawAnswers, ResponseFilenameMapping } from "./types";

export interface MapAnswersParams {
  formTemplate: FormProperties;
  rawAnswers: RawAnswers;
  attachments?: ResponseFilenameMapping;
  answerFormatter?: AnswerFormatter;
}

export const mapAnswers = ({
  formTemplate,
  rawAnswers,
  attachments,
  answerFormatter = getAnswerAsString,
}: MapAnswersParams): MappedAnswer[] => {
  const elementMap = getElementMap(formTemplate);

  return Object.entries(rawAnswers)
    .map(([questionId, rawAnswer]) =>
      getMappedAnswer({
        question: elementMap.get(Number(questionId)),
        rawAnswer,
        attachments,
        answerFormatter,
      })
    )
    .filter((item): item is MappedAnswer => item !== null);
};

const getMappedAnswer = ({
  question,
  rawAnswer,
  attachments,
  answerFormatter,
}: {
  question?: FormElement;
  rawAnswer: RawAnswers[string];
  attachments?: ResponseFilenameMapping;
  answerFormatter: AnswerFormatter;
}): MappedAnswer => {
  if (!question) {
    return createFallbackMappedAnswer({ rawAnswer });
  }

  if (question.type === FormElementTypes.dynamicRow && Array.isArray(rawAnswer)) {
    return handleAnswerArray({ question, rawAnswers: rawAnswer, attachments, answerFormatter });
  }

  return createAnswerObject({
    question,
    answer: answerFormatter(question, rawAnswer, attachments),
  });
};

const handleAnswerArray = ({
  question,
  rawAnswers,
  attachments,
  answerFormatter,
}: {
  question: FormElement;
  rawAnswers: RawAnswers[string][];
  attachments?: ResponseFilenameMapping;
  answerFormatter: AnswerFormatter;
}): MappedAnswer => {
  const subElements = question.properties?.subElements ?? [];
  const subQuestions = subElements.filter((sub) => sub.type !== FormElementTypes.richText);

  const rows = rawAnswers.map((row) => {
    const values = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>);

    return values.map((value, index) => {
      const subQuestion = subQuestions[index];

      if (!subQuestion) {
        return createFallbackMappedAnswer({ questionId: index, rawAnswer: value as Response });
      }

      return getMappedAnswer({
        question: subQuestion,
        rawAnswer: value as Response,
        attachments,
        answerFormatter,
      });
    });
  });

  return createAnswerObject({ question, answer: rows });
};

export const getElementMap = (formTemplate: FormProperties): Map<number, FormElement> => {
  return new Map((formTemplate.elements ?? []).map((element) => [element.id, element]));
};
