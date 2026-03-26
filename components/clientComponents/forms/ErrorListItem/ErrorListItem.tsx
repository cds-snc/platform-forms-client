"use client";
import React from "react";

export interface ErrorListProps {
  errorKey: string;
  value: string | undefined;
  children?: React.ReactNode;
}

const scrollErrorInView = (id: string) => {
  const element = document.getElementById(id);
  const labelElement = document.getElementById(`label-${id}`);
  // For fieldsets (radio/checkbox groups), focus the first input inside rather than
  // the fieldset itself. This avoids needing a tabindex on the fieldset which causes
  // Chrome+TalkBack to double-announce the group label.
  const focusTarget =
    element?.tagName === "FIELDSET" ? (element.querySelector("input") ?? element) : element;
  const scrollTarget = labelElement ?? element;
  focusTarget?.focus();
  scrollTarget?.scrollIntoView();
};

/**
 * @returns ReactElement for displaying the error list
 * @param errorKey The key for the form element for the error
 * @param value The error to be displayed
 */
export const ErrorListItem = (props: ErrorListProps): React.ReactElement => {
  const { errorKey, value, children } = props;

  return (
    <li>
      <a
        href={`#${errorKey}`}
        className="gc-error-link"
        onKeyDown={(e) => {
          if (e.code === "Space") {
            e.preventDefault();
            scrollErrorInView(errorKey);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          scrollErrorInView(errorKey);
        }}
      >
        {children || value}
      </a>
    </li>
  );
};
