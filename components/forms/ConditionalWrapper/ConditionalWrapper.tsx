import React from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { ConditionalRule, FormElement } from "@lib/types";
import { inGroup, parentHasMatchedRule } from "@lib/formContext";

export const ConditionalWrapper = ({
  children,
  element,
  rules,
}: {
  children: React.ReactElement;
  element: FormElement;
  rules: ConditionalRule[] | null;
}) => {
  const { matchedIds, currentGroup, groups, formRecord } = useGCFormsContext();
  // Check if we're using groups and if the current element is in a group
  if (
    currentGroup &&
    groups &&
    Object.keys(groups).length >= 1 &&
    groups &&
    !inGroup(currentGroup, element.id, groups)
  )
    return null;

  // If there's no rule or no choiceId, just return the children
  if (!rules || rules.length < 1) return children;

  const hasMatchedRule = rules.some((rule) => matchedIds.includes(rule?.choiceId));

  // If we have a matched rule for the element
  // Also ensure a parent element also has a matched rule
  // This is to ensure that the parent element is visible
  if (hasMatchedRule) {
    const parentIds = rules.map((rule) => rule?.choiceId.split(".")[0]);
    if (parentHasMatchedRule(formRecord.form.elements, parentIds, matchedIds)) {
      return children;
    }
  }

  // Otherwise, return null
  return null;
};
