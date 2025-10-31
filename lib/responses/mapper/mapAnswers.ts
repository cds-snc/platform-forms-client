import { type FormElement, FormElementTypes } from "@gcforms/types";
import type { MappedAnswer } from "./types";
import { createFallbackMappedAnswer, createAnswerObject } from "./utils/toAnswerObject";
import { getAnswerAsString } from "./utils/toString";
import { FormProperties } from "@gcforms/types";

/**
 * Map raw response answers to the standardized MappedAnswer shape using a template.
 *
 * @param {object} params
 * @param {PublicFormRecord} params.template - The public form template containing element definitions.
 * @param {Record<string, Response>} params.rawAnswers - Raw answers keyed by question id.
 * @returns {MappedAnswer[]} Array of mapped answers (one per answered question).
 *
 * Notes: If a question definition cannot be found for an answer, a fallback
 * mapped answer is produced so the output array remains consistent.
 */
export const mapAnswers = ({
  formTemplate,
  rawAnswers,
}: {
  formTemplate: FormProperties;
  rawAnswers: Record<string, Response>;
}): MappedAnswer[] => {
  const elementMap = getElementMap(formTemplate);

  const mappedAnswers: Array<MappedAnswer | null> = Object.entries(rawAnswers).map(
    ([questionId, rawAnswer]) => {
      const question = elementMap.get(Number(questionId));
      return getMappedAnswer({ question, rawAnswer });
    }
  );

  return mappedAnswers.filter((item): item is MappedAnswer => item !== null);
};

/**
 * Convert a single raw answer into a MappedAnswer, using the question
 * definition when available. If the question is missing, a fallback mapped
 * answer will be returned. Dynamic row answers are delegated to handleAnswerArray.
 */
const getMappedAnswer = ({
  question,
  rawAnswer,
}: {
  question?: FormElement;
  rawAnswer: Response;
}): MappedAnswer => {
  if (!question) {
    return createFallbackMappedAnswer({ rawAnswer });
  }

  if (question.type === FormElementTypes.dynamicRow && Array.isArray(rawAnswer)) {
    return handleAnswerArray({ question, rawAnswers: rawAnswer });
  }

  return createAnswerObject({
    question,
    answer: getAnswerAsString(question, rawAnswer as unknown),
  });
};

/**
 * Convert a dynamicRow raw answer (array of rows) into a MappedAnswer.
 *
 * Each row is converted into an array of MappedAnswer corresponding to the
 * subElements of the dynamicRow. If a sub-element definition is missing,
 * a fallback mapped answer is created for that cell.
 */
const handleAnswerArray = ({
  question,
  rawAnswers,
}: {
  question?: FormElement;
  rawAnswers: Response[];
}): MappedAnswer => {
  if (!question || !Array.isArray(rawAnswers)) {
    throw new Error("Invalid input for handleAnswerArray");
  }

  const subElements = question.properties?.subElements ?? [];
  const subQuestions = subElements.filter((sub) => sub.type !== FormElementTypes.richText);

  // Map each row of answers
  const rows = (rawAnswers as unknown[]).map((row) => {
    const values = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>);

    // Inner mapping for sub-answers
    const subAnswers: MappedAnswer[] = values.map((value, index) => {
      const subQuestion = subQuestions[index];

      if (!subQuestion) {
        return createFallbackMappedAnswer({ questionId: index, rawAnswer: value });
      }

      return getMappedAnswer({ question: subQuestion, rawAnswer: value });
    });

    return subAnswers;
  });

  return createAnswerObject({
    question,
    answer: rows,
  });
};

/**
 * Build a Map from element id to FormElement for quick lookups.
 *
 * @param {PublicFormRecord} template
 * @returns {Map<number, FormElement>} map of element id -> element
 */
export const getElementMap = (formTemplate: FormProperties) => {
  const elements = formTemplate.elements || [];
  const elementMap = new Map<number, FormElement>();
  elements.forEach((element) => elementMap.set(element.id, element));
  return elementMap;
};
