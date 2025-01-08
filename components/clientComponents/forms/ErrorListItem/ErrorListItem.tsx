"use client";
import React from "react";

import { FormElement } from "@lib/types";

export interface ErrorListProps {
  elements: FormElement[];
  errorKey: string;
  value: string | undefined;
}

/**
 * scrollErrorInView [private] is called when you click on an error link at the top of the form
 * @param id The id of the input field that has the error and we need to focus
 */
const scrollErrorInView = (id: string) => {
  const inputElement = document.getElementById(id);
  const labelElement = document.getElementById(`label-${id}`);
  if (labelElement && inputElement) {
    inputElement.focus();
    labelElement.scrollIntoView();
  }
};

/**
 * @returns ReactElement for displaying the error list
 * @param errorKey The key for the form element for the error
 * @param value The error to be displayed
 */
export const ErrorListItem = (props: ErrorListProps): React.ReactElement => {
  const { errorKey, value, elements } = props;

  // Find the element that has the error based on the key
  const element = elements.find((element) => String(element.id) === errorKey);

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
        {value} {element?.properties.titleEn}
      </a>
    </li>
  );
};
