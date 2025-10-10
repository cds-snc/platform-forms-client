import { FormElement, FormElementTypes } from "@gcforms/types";
import { getAnswerAsString } from "./formatAnswers/toString";
import { FormProperties, Response } from "@gcforms/types";

export type MappedAnswer =
  | {
      type: string;
      questionId: number;
      questionEn?: string;
      questionFr?: string;
      answer: string | MappedAnswer[][];
      [key: string]: unknown;
    }
  | string;

export const getAnswerObject = ({
  question,
  rawAnswer,
}: {
  question?: FormElement;
  rawAnswer: Response;
}): MappedAnswer | null => {
  if (!question) return null;

  if (question.type === FormElementTypes.dynamicRow && Array.isArray(rawAnswer)) {
    return handleAnswerArray({ question, rawAnswers: rawAnswer });
  }

  return {
    type: String(question.type),
    questionId: question.id,
    questionEn: question.properties?.titleEn,
    questionFr: question.properties?.titleFr,
    answer: getAnswerAsString(question as FormElement, rawAnswer as unknown),
  };
};

export const mapAnswers = ({
  formTemplate,
  rawAnswers,
}: {
  formTemplate: FormProperties;
  rawAnswers: Response;
}): MappedAnswer[] => {
  if (!formTemplate || !formTemplate.elements || !rawAnswers) return [];

  const elements = formTemplate.elements;
  const elementMap = new Map<number, FormElement>();
  elements.forEach((element) => elementMap.set(element.id, element));

  const mappedAnswers: Array<MappedAnswer | null> = Object.entries(rawAnswers).map(
    ([questionId, rawAnswer]) => {
      const question = elementMap.get(Number(questionId));
      return getAnswerObject({ question, rawAnswer });
    }
  );

  return mappedAnswers.filter((item): item is MappedAnswer => item !== null);
};

export const handleAnswerArray = ({
  question,
  rawAnswers,
}: {
  question?: FormElement;
  rawAnswers: unknown;
}): MappedAnswer => {
  if (!question || !Array.isArray(rawAnswers)) return "";

  const subElements = question.properties?.subElements ?? [];
  const subQuestions = subElements.filter((sub) => sub.type !== FormElementTypes.richText);

  const rows = (rawAnswers as unknown[]).map((row) => {
    const values = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>);

    const subAnswers: MappedAnswer[] = values.map((value, index) => {
      const subQuestion = subQuestions[index];

      if (!subQuestion) {
        return {
          questionId: index,
          type: "-",
          questionEn: "-",
          questionFr: "-",
          answer: String(value ?? ""),
        } as MappedAnswer;
      }

      const resolved = getAnswerObject({ question: subQuestion as FormElement, rawAnswer: value });
      if (resolved === null) return String(value ?? "");
      return resolved;
    });

    return subAnswers;
  });

  return {
    questionId: question.id,
    type: String(question.type),
    questionEn: question.properties?.titleEn,
    questionFr: question.properties?.titleFr,
    answer: rows as MappedAnswer[][],
  } as MappedAnswer;
};
