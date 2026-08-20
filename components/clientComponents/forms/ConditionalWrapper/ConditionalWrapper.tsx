"use client";
import { Activity, type ReactElement } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { type FormElement } from "@gcforms/types";

export const ConditionalWrapper = ({
  children,
  element,
}: {
  children: ReactElement;
  element: FormElement;
}) => {
  const { visibleElementIds } = useGCFormsContext();

  // Check if the element is a child of a dynamic element
  if (element.subId) {
    return children;
  }

  return (
    <Activity mode={visibleElementIds.has(element.id.toString()) ? "visible" : "hidden"}>
      {children}
    </Activity>
  );
};
