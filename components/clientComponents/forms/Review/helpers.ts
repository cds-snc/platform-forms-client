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

// TODO: rename to ReviewSection
// Created for the Review page to help structure printing out questions-and-answers
export type ReviewItem = {
  id: string;
  name: string;
  title: string;
  formItems: FormItem[];
};

// Used by sub components that know enough to "toString" themselves via a factory that determines
// which FormItem by look at the FormItem.type
export type FormItem = {
  type: FormElementTypes;
  label: string;
  values: string | string[] | FileInputResponse | DateObject | FormItem[];
  originalFormElement: FormElement | undefined; // TODO: rename element
};

// TODO: GroupsType - search for and see if can use, reuse an existing type if possible
// Local type to help structure an intermediary object used to construct Review Items
type GroupsWithElementIds = {
  groupId: string;
  group: Group;
  elementIds: number[];
};

export const getFormElements = (elementIds: number[], formElements: FormElement[]) => {
  if (!Array.isArray(elementIds) || !formElements) {
    return [];
  }

  return elementIds.map((elementId) => formElements.find((item) => item.id === elementId));
};

// TODO Group  elements array - may be able to use what is allready written in the group history utils
export const getGroupsWithElements = (
  formElements: FormElement[],
  formValues: FormValues | void,
  groups: GroupsType | undefined,
  groupHistoryIds: string[],
  matchedIds: string[]
) => {
  if (!formValues || !groups) {
    return [] as GroupsWithElementIds[];
  }

  const groupsWithElements = groupHistoryIds
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
        group, // Group with name, title,.. plus elements that may have invisible (not shown elements) - don't use this one
        elementIds, // Group elementIds that are visible (not hidden)
      } as GroupsWithElementIds;
    });

  return groupsWithElements;
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
      originalFormElement: formElement,
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

  const reviewItems = groupsWithElementIds.map((groupWithElementIds) => {
    const elements = getFormElements(groupWithElementIds.elementIds, formElements);
    const formItems = createFormItems(elements, formValues, language);
    return {
      id: groupWithElementIds.groupId,
      name: groupWithElementIds.group.name,
      title: getGroupTitle(groupWithElementIds.groupId, language),
      formItems,
    } as ReviewItem;
  });
  // logMessage.info("reviewItems", reviewItems);
  return reviewItems;
};
