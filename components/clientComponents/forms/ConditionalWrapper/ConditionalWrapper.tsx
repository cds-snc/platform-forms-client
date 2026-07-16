"use client";
import React from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { useCustomEvent, EventKeys } from "@lib/hooks/useCustomEvent";
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
  const { isElementVisible, currentGroup, groups } = useGCFormsContext();
  const { Event } = useCustomEvent();
  const elementId = element.id.toString();

  // Local visibility state — updated via event subscription so visibility
  // changes are applied without recomputing conditional logic inside every wrapper
  const [localVisible, setLocalVisible] = React.useState(() => isElementVisible(elementId));

  React.useEffect(() => {
    const handler = ({ visibilityChanges }: { visibilityChanges?: Record<string, boolean> }) => {
      if (visibilityChanges && elementId in visibilityChanges) {
        setLocalVisible(visibilityChanges[elementId]);
      }
    };
    Event.on(EventKeys.formValuesChanged, handler);
    return () => Event.off(EventKeys.formValuesChanged, handler);
  }, [Event, elementId]);

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

  if (!localVisible) {
    return null;
  }

  return children;
};
