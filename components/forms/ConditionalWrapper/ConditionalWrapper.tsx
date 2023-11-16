import React from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { ConditionalRule, FormElement } from "@lib/types";
import { inGroup } from "@lib/formContext";
import { useIsAdminUser } from "@components/form-builder/hooks/useIsAdminUser";

export const ConditionalWrapper = ({
  children,
  element,
  rule,
}: {
  children: React.ReactElement;
  element: FormElement;
  rule: ConditionalRule | null;
}) => {
  const { matchedIds, currentGroup, groups } = useGCFormsContext();

  const conditionalLogic = useIsAdminUser();

  if (!conditionalLogic) return children;

  // Check if we're using groups and if the current element is in a group
  if (
    currentGroup &&
    groups &&
    Object.keys(groups).length >= 1 &&
    groups &&
    !inGroup(currentGroup, element.id, groups)
  )
    return null;

  // If there's no rule or no whenId, just return the children
  if (!rule || !rule?.whenId) return children;

  // If the whenId is in the matchedIds, return the children
  // @todo -- update here to handle array of rules
  if (matchedIds.includes(rule?.whenId)) return children;

  // Otherwise, return null
  return null;
};
