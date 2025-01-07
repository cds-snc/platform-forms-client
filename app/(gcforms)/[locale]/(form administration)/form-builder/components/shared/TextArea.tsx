"use client";
import React from "react";

export const TextArea = ({
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
}) => {
  return (
    <textarea
      id={id}
      data-testid={testId}
      name={name}
      aria-describedby={describedBy}
      className={`${className} my-2 rounded border-1.5 border-solid border-black-default px-3 py-2 focus:border-blue-focus focus:outline focus:outline-2 focus:outline-blue-focus`}
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
