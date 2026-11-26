import type { FormProperties } from "@gcforms/types";
import { formHasGroups } from "../template/groups";
import { sortByGroups, sortByLayout } from "../template/layout";
import type { MappedAnswer } from "./types";

export const orderAnswersByTemplate = (
  mappedAnswers: MappedAnswer[],
  formTemplate: FormProperties
): MappedAnswer[] => {
  const elements = Array.isArray(formTemplate.elements) ? formTemplate.elements : [];
  const sortedElements = formHasGroups(formTemplate)
    ? sortByGroups({ form: formTemplate, elements })
    : sortByLayout({
        layout: Array.isArray(formTemplate.layout) ? formTemplate.layout : [],
        elements,
      });
  const answersByQuestionId = new Map(
    mappedAnswers
      .filter((answer) => answer.type !== "-")
      .map((answer) => [answer.questionId, answer])
  );
  const orderedAnswers = sortedElements.flatMap((element) => {
    const answer = answersByQuestionId.get(element.id);
    return answer ? [answer] : [];
  });
  const orderedAnswerSet = new Set(orderedAnswers);

  return [...orderedAnswers, ...mappedAnswers.filter((answer) => !orderedAnswerSet.has(answer))];
};
