import { FormElement } from "@gcforms/types";

export const isUniqueQuestionId = (
  elements: FormElement[],
  questionId: string,
  currentItem: FormElement
) => {
  const questionIds = elements
    .flatMap((element: FormElement) => [element, ...(element.properties.subElements || [])])
    .filter((element: FormElement) => element.id !== currentItem.id)
    .map((element: FormElement) => element.properties?.questionId)
    .filter(Boolean);

  return !questionIds.includes(questionId);
};

export const validateUniqueQuestionIds = (elements: FormElement[]) => {
  const questionIds = elements
    .flatMap((element: FormElement) => [element, ...(element.properties.subElements || [])])
    .map((element: FormElement) => element.properties?.questionId)
    .filter(Boolean);

  return questionIds.length === new Set(questionIds).size;
};
