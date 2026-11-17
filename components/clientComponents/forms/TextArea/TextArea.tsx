"use client";
import React, { type JSX } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { cn } from "@lib/utils";
import { useCharacterCount } from "@lib/hooks/useCharacterCount";
import { useWordCount } from "@lib/hooks/useWordCount";
import { getErrorMessageId } from "@lib/a11yHelpers";

export interface TextAreaProps extends InputFieldProps {
  children?: React.ReactNode;
  maxWords?: number;
  placeholder?: string;
}

export const TextArea = (
  props: TextAreaProps & JSX.IntrinsicElements["textarea"]
): React.ReactElement => {
  const {
    id,
    className,
    ariaDescribedBy,
    required,
    children,
    placeholder,
    maxLength,
    maxWords,
    lang,
  } = props;

  const [field, meta, helpers] = useField(props);

  const characterCountResult = useCharacterCount({
    maxLength,
    id: id ?? "",
    lang,
  });
  const wordCountResult = useWordCount({
    maxWords,
    id: id ?? "",
    lang,
  });

  // Merge the aria-describedby values
  const characterCountAriaIds = characterCountResult.ariaDescribedByIds(
    !!meta.error,
    ariaDescribedBy
  );
  const wordCountAriaIds = wordCountResult.ariaDescribedByIds(!!meta.error, undefined); // Don't pass ariaDescribedBy twice
  // Combine them
  const mergedAriaDescribedBy = [
    characterCountAriaIds["aria-describedby"],
    wordCountAriaIds["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ");

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      characterCountResult.setRemainingCharacters(maxLength - event.target.value.length);
    }
    if (maxWords) {
      wordCountResult.setRemainingWords(
        maxWords - event.target.value.split(/\s+/).filter(Boolean).length
      );
    }
  };

  const classes = cn("gcds-textarea", className, meta.error && "gcds-error");
  const errorMessageId = getErrorMessageId(id);

  return (
    <>
      {meta.error && <ErrorMessage id={errorMessageId}>{meta.error}</ErrorMessage>}
      <textarea
        data-testid="textarea"
        className={classes}
        id={id}
        aria-required={required ? "true" : undefined}
        aria-invalid={meta.error ? "true" : undefined}
        placeholder={placeholder}
        {...(mergedAriaDescribedBy ? { "aria-describedby": mergedAriaDescribedBy } : {})}
        {...field}
        onChange={handleTextAreaChange}
      >
        {children}
      </textarea>
      <characterCountResult.CharacterCountDisplay />
      <wordCountResult.WordCountDisplay />
    </>
  );
};
