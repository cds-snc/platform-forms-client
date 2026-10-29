"use client";
import React from "react";
import { cn } from "@lib/utils";
import { StoreInputFeedback, useInputFeedback } from "./InputFeedback";

const TextAreaControl = ({
  id,
  name,
  describedBy,
  value,
  onChange,
  onKeyDown,
  className,
  placeholder,
  lang,
  testId,
  isInvalid,
}: {
  id: string;
  name?: string;
  placeholder?: string;
  describedBy?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  lang?: string;
  testId?: string;
  isInvalid?: boolean;
}) => {
  const feedback = useInputFeedback(describedBy);
  return (
    <textarea
      id={id}
      data-testid={testId}
      name={name}
      aria-describedby={feedback.describedBy}
      aria-invalid={isInvalid || feedback.isInvalid || undefined}
      className={cn(
        className,
        "border-1.5 border-black-default focus:border-blue-focus focus:outline-blue-focus my-2 rounded border-solid px-3 py-2 focus:outline-2 focus:outline-solid",
        feedback.controlClassName
      )}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...(lang && { lang: lang })}
    >
      {value}
    </textarea>
  );
};

export const TextArea = (props: React.ComponentProps<typeof TextAreaControl>) => (
  <StoreInputFeedback inputId={props.id}>
    <TextAreaControl {...props} />
  </StoreInputFeedback>
);
