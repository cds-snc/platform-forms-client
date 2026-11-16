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

  const { setRemainingCharacters, ariaDescribedByIds, CharacterCountDisplay } = useCharacterCount({
    maxLength,
    id: id ?? "",
    lang,
  });
  const { setRemainingWords, WordCountDisplay } = useWordCount({
    maxWords,
    id: id ?? "",
    lang,
  });

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
    if (maxWords) {
      setRemainingWords(maxWords - event.target.value.split(/\s+/).filter(Boolean).length);
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
        {...ariaDescribedByIds(!!meta.error, ariaDescribedBy)}
        {...field}
        onChange={handleTextAreaChange}
      >
        {children}
      </textarea>
      <CharacterCountDisplay />
      <WordCountDisplay />
    </>
  );
};
