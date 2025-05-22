"use client";
import React from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { ConditionalRule, FormElement } from "@lib/types";
import { inGroup, checkVisibilityRecursive } from "@lib/formContext";
import { Announce } from "./Announce";

export const ConditionalWrapper = ({
  children,
  element,
  rules,
  lang,
}: {
  children: React.ReactElement;
  element: FormElement;
  rules: ConditionalRule[] | null;
  lang: string;
}) => {
  const { getValues, currentGroup, groups, formRecord } = useGCFormsContext();

  // Check if the element is a child of a dynamic element
  if (element.subId) {
    return children;
  }

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

  const values = getValues() || {};

  const isVisible = checkVisibilityRecursive(formRecord.form.elements, element, values);

  if (!isVisible) {
    return null;
  }

  return (
    <Announce element={element} lang={lang}>
      {children}
    </Announce>
  );
};
