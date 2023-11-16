import { FormElement } from "@lib/types";
import { PublicFormRecord, ConditionalRule } from "@lib/types";

export type Group = { nextAction?: string; elements: string[] };
export type GroupsType = Record<string, Group>;
export type FormValues = Record<string, string | string[]>;
export type ChoiceRule = { questionId: string; choiceId: string };

export function findChoiceIndex(
  formElements: FormElement[],
  elementId: number,
  value: string | string[]
) {
  // Find the form element with the specified id
  const element = formElements.find((element) => element.id === elementId);

  // If the element was not found or it doesn't have choices, return -1
  if (!element || !Array.isArray(element.properties.choices)) {
    return -1;
  }

  // Find the index of the choice with the specified value
  const choiceIndex = element.properties.choices.findIndex(
    (choice) => choice.en === value || choice.fr === value
  );

  return choiceIndex;
}

export const mapIdsToValues = (formRecord: PublicFormRecord, values: FormValues): string[] => {
  const elementIds = formRecord.form.elements.map((element) => element.id);

  // Find elementIds that are in the current values object
  const valueIds = elementIds.filter((id) => values[id] && values[id].length > 0);

  // For each found id, find the index of the "choice" with the specified value
  const choiceIds = valueIds.map((id) => {
    if (!values[id]) {
      return;
    }

    const value = values[id];

    if (!Array.isArray(value)) {
      const choiceId = findChoiceIndex(formRecord.form.elements, id, value);
      if (choiceId > -1) {
        return `${id}.${choiceId}`;
      }
      return;
    }

    return value.map((val) => {
      const choiceId = findChoiceIndex(formRecord.form.elements, id, val);
      if (choiceId > -1) {
        return `${id}.${choiceId}`;
      }
    });
  });

  // flatten array and remove undefined values
  return choiceIds.flat().filter((id) => id) as string[];
};

export function idArraysMatch(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export const matchRule = (
  rule: ConditionalRule,
  formRecord: PublicFormRecord,
  values: FormValues
) => {
  const matchedIds = mapIdsToValues(formRecord, values);
  if (matchedIds.includes(rule?.whenId)) return true;
  return false;
};

export const inGroup = (groupId: string, elementId: number, groups: GroupsType) => {
  if (!groups[groupId]) return false;
  return groups[groupId].elements.find((value) => elementId.toString() === value);
};

export const getElementsWithRuleForChoice = ({
  formElements,
  itemId,
}: {
  formElements: FormElement[];
  itemId: number;
}) => {
  const elements: ChoiceRule[] = [];

  formElements.forEach((element) => {
    // Look for conditional rules
    if (element.properties.conditionalRules) {
      const whenId = element.properties.conditionalRules.whenId;

      if (whenId && Number(whenId.split(".")[0]) === itemId) {
        // add the element to the group
        elements.push({ questionId: element.id.toString(), choiceId: whenId });
      }
    }
  });

  return elements;
};

export const getElementsUsingChoiceId = ({
  formElements,
  choiceId,
}: {
  formElements: FormElement[];
  choiceId: string;
}) => {
  const elements: ChoiceRule[] = [];

  formElements.forEach((element) => {
    // Look for conditional rules
    if (element.properties.conditionalRules) {
      const whenId = element.properties.conditionalRules.whenId;

      if (whenId && whenId === choiceId) {
        // add the element to the group
        elements.push({ questionId: element.id.toString(), choiceId: whenId });
      }
    }
  });

  return elements;
};

export const diffChoiceRules = (oldRules: ChoiceRule[], newRules: ChoiceRule[]) => {
  const addedRules = newRules.filter((newRule) => {
    return !oldRules.find((oldRule) => {
      return oldRule.questionId === newRule.questionId && oldRule.choiceId === newRule.choiceId;
    });
  });

  const removedRules = oldRules.filter((oldRule) => {
    return !newRules.find((newRule) => {
      return oldRule.questionId === newRule.questionId && oldRule.choiceId === newRule.choiceId;
    });
  });

  return { addedRules, removedRules };
};
