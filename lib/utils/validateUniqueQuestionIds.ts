import { FormElement } from "@gcforms/types";

// Helper to extract all questionIds from elements and their subElements
const getQuestionIds = (elements: FormElement[], excludeId?: string) =>
  elements
    .flatMap((element) => [element, ...(element.properties.subElements || [])])
    .filter((element) => (excludeId ? String(element.id) !== String(excludeId) : true))
    .map((element) => element.properties?.questionId)
    .filter(Boolean);

export const isUniqueQuestionId = (
  elements: FormElement[],
  questionId: string,
  currentItem: FormElement
) => {
  const questionIds = getQuestionIds(elements, String(currentItem.id));
  
  return !questionIds.includes(questionId);
};

export const validateUniqueQuestionIds = (elements: FormElement[]) => {
  const questionIds = getQuestionIds(elements);
  
  return questionIds.length === new Set(questionIds).size;
};
