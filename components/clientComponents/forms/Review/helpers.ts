import {
  filterShownElements,
  filterValuesForShownElements,
  FormValues,
  getElementIdsAsNumber,
  Group,
  GroupsType,
} from "@lib/formContext";
import { FileInputResponse, FormElement, FormElementTypes } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import { Language } from "@lib/types/form-builder-types";
import { DateObject } from "../FormattedDate/types";

// Created for the Review page to help structure printing out questions-and-answers
export type ReviewSection = {
  id: string;
  name: string;
  title: string;
  formItems: FormItem[];
};

// Used by sub components to print themself using the element type
export type FormItem = {
  type: FormElementTypes;
  label: string;
  values: string | string[] | FileInputResponse | DateObject | FormItem[];
  element: FormElement | undefined;
};

// Local type to help structure an intermediary object used to construct Review Items
type GroupsWithElementIds = {
  groupId: string;
  group: Group; // Mainly used to later get the group name, entire group added for future flexibility
  elementIds: number[]; // ElementIds from this group that are visible (not hidden)
};

export const getFormElements = (elementIds: number[], formElements: FormElement[]) => {
  if (!Array.isArray(elementIds) || !formElements) {
    return [];
  }

  return elementIds.map((elementId) => formElements.find((item) => item.id === elementId));
};

export const getGroupsWithElementIds = (
  formElements: FormElement[],
  formValues: FormValues | void,
  groups: GroupsType | undefined,
  groupHistoryIds: string[],
  matchedIds: string[]
) => {
  if (!formValues || !groups || !Array.isArray(groupHistoryIds)) {
    return [] as GroupsWithElementIds[];
  }

  return groupHistoryIds
    .filter((key) => key !== "review")
    .map((groupId) => {
      const group: Group = groups[groupId as keyof typeof groups] || {};

      // Remove any hidden elements from Show-Hide (only include elements interacted with by the user)
      const shownFormElements = filterShownElements(formElements, matchedIds);
      const elementIds = getElementIdsAsNumber(
        filterValuesForShownElements(group.elements, shownFormElements)
      );

      return {
        groupId: groupId,
        group,
        elementIds,
      } as GroupsWithElementIds;
    });
};

export const createFormItems = (
  formElements: (FormElement | undefined)[],
  formValues: FormValues,
  language: string
) => {
  if (!Array.isArray(formElements) || !formValues) {
    return [];
  }

  return formElements.map((formElement) => {
    return {
      type: formElement?.type,
      label: formElement?.properties?.[getLocalizedProperty("title", language)] as string,
      values: formValues[formElement?.id as unknown as keyof typeof formValues] as string,
      element: formElement,
    } as FormItem;
  });
};

export const getReviewItems = (
  formElements: FormElement[],
  formValues: FormValues | void,
  groupsWithElementIds: GroupsWithElementIds[],
  language: Language,
  getGroupTitle: (() => string) | ((groupId: string | null, language: Language) => string)
) => {
  if (!Array.isArray(groupsWithElementIds) || !formValues) {
    return [];
  }

  return groupsWithElementIds.map((groupWithElementIds) => {
    const elements = getFormElements(groupWithElementIds.elementIds, formElements);
    const formItems = createFormItems(elements, formValues, language);
    return {
      id: groupWithElementIds.groupId,
      name: groupWithElementIds.group.name,
      title: getGroupTitle(groupWithElementIds.groupId, language),
      formItems,
    } as ReviewSection;
  });
};
