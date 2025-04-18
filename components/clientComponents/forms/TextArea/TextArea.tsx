"use client";
import React, { useState } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import type { JSX } from "react";

export interface TextAreaProps extends InputFieldProps {
  children?: React.ReactNode;
  placeholder?: string;
}

export const TextArea = (
  props: TextAreaProps & JSX.IntrinsicElements["textarea"]
): React.ReactElement => {
  const { id, className, ariaDescribedBy, required, children, placeholder, maxLength } = props;

  const { t } = useTranslation("common");

  const [field, meta, helpers] = useField(props);

  const [remainingCharacters, setRemainingCharacters] = useState(maxLength ?? 0);

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
  };

  const characterCountMessages = {
    part1: t("formElements.characterCount.part1"),
    part2: t("formElements.characterCount.part2"),
    part1Error: t("formElements.characterCount.part1-error"),
    part2Error: t("formElements.characterCount.part2-error"),
  };

  const remainingCharactersMessage =
    characterCountMessages.part1 + " " + remainingCharacters + " " + characterCountMessages.part2;

  const tooManyCharactersMessage =
    characterCountMessages.part1Error +
    " " +
    remainingCharacters * -1 +
    " " +
    characterCountMessages.part2Error;

  const ariaDescribedByIds = () => {
    const returnValue = [];
    if (meta.error) returnValue.push("errorMessage" + id);
    if (maxLength && (remainingCharacters < 0 || remainingCharacters < maxLength * 0.25))
      returnValue.push("characterCountMessage" + id);
    if (ariaDescribedBy) returnValue.push(ariaDescribedBy);
    return returnValue.length > 0 ? { "aria-describedby": returnValue.join(" ") } : {};
  };

  const classes = cn("gcds-textarea", className, meta.error && "gcds-error");

  return (
    <>
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <textarea
        data-testid="textarea"
        className={classes}
        id={id}
        required={required}
        placeholder={placeholder}
        {...ariaDescribedByIds()}
        {...field}
        onChange={handleTextAreaChange}
      >
        {children}
      </textarea>
      <div id={"characterCountMessage" + id} className="gc-error-message" aria-live="polite">
        {maxLength &&
          remainingCharacters < maxLength * 0.25 &&
          remainingCharacters >= 0 &&
          remainingCharactersMessage}

        {maxLength && remainingCharacters < 0 && tooManyCharactersMessage}
      </div>
    </>
  );
};
