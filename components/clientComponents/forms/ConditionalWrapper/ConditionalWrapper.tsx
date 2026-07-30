"use client";
import { useGCFormsContext, useVisibilityContext } from "@lib/hooks/useGCFormContext";
import { type ConditionalRule, type FormElement } from "@gcforms/types";
import { inGroup } from "@gcforms/core";

export const ConditionalWrapper = ({
  children,
  element,
  rules,
}: {
  children: React.ReactElement;
  element: FormElement;
  rules: ConditionalRule[] | null;
  lang: string;
}) => {
  const { currentGroup, groups } = useGCFormsContext();
  const { isElementVisible } = useVisibilityContext();

  // Check if the element is a child of a dynamic element
  if (element.subId) {
    return children;
  }

  // Check if we're using groups and if the current element is in a group
  if (
    currentGroup &&
    groups &&
    Object.keys(groups).length >= 1 &&
    !inGroup(currentGroup, element.id, groups)
  )
    return null;

  // If there's no rule or no choiceId, just return the children
  if (!rules || rules.length < 1) return children;

  if (!isElementVisible(element.id.toString())) {
    return null;
  }

  return children;
};
