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
  questionLabel?: string;
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
    questionLabel,
  } = props;

  const [field, meta, helpers] = useField(props);

  const characterCountResult = useCharacterCount({
    maxLength,
    id: id ?? "",
    lang,
    value: field.value,
    error: meta.error,
    setError: helpers.setError,
    questionLabel,
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
    ...new Set(
      [characterCountAriaIds["aria-describedby"], wordCountAriaIds["aria-describedby"]]
        .filter(Boolean)
        .flatMap((ids) => ids.split(/\s+/))
    ),
  ].join(" ");

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    let nextValue = event.target.value;
    if (maxWords) {
      // Prevent more words than maxWords
      const words = nextValue.split(/\s+/).filter(Boolean);
      if (words.length > maxWords) {
        nextValue = words.slice(0, maxWords).join(" ");
      }
      wordCountResult.setRemainingWords(maxWords - nextValue.split(/\s+/).filter(Boolean).length);
    }
    helpers.setValue(nextValue);
    characterCountResult.updateCharacterError(nextValue);
  };

  const classes = cn("gcds-textarea", className, meta.error && "gcds-error");
  const errorMessageId = getErrorMessageId(id);

  return (
    <>
      <div aria-live={characterCountResult.hasCharacterError ? "polite" : undefined}>
        {meta.error && <ErrorMessage id={errorMessageId}>{meta.error}</ErrorMessage>}
      </div>
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
      <wordCountResult.wordCountDisplay />
    </>
  );
};
