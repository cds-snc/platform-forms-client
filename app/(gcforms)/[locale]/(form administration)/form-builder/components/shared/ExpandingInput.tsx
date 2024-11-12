"use client";
import React, { FocusEventHandler } from "react";

import { cn } from "@lib/utils";

interface Props {
  id: string;
  name?: string;
  type?: string;
  wrapperClassName?: string;
  className?: string;
  placeholder?: string;
  describedBy?: string;
  ariaLabel?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  ref?: React.RefObject<HTMLTextAreaElement>;
  isInvalid?: boolean;
  lang?: string;
  onBlur?: FocusEventHandler;
}

type Ref = HTMLTextAreaElement;

const ExpandingInput = React.forwardRef<Ref, Props>((props, ref) => {
  const {
    id,
    name,
    describedBy,
    ariaLabel, // Use a real <label> instead when possible
    value,
    onChange,
    onKeyDown,
    placeholder,
    isInvalid = false,
    lang,
    onBlur,
    wrapperClassName,
    className,
  } = props;

  return (
    <div
      className={cn(
        "input-sizer stacked border-2 border-solid border-slate-500 rounded-sm",
        wrapperClassName
      )}
      data-value={value}
    >
      <textarea
        rows={1}
        maxLength={2000}
        id={id}
        className={cn(
          "focus:bg-gray-default focus:outline-0 overflow-y-visible rounded-sm",
          className
        )}
        name={name}
        aria-describedby={describedBy}
        aria-invalid={isInvalid ? true : false}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur && onBlur}
        ref={ref}
        {...(lang && { lang: lang })}
        autoComplete="off"
        {...(ariaLabel && { "aria-label": ariaLabel })}
      />
    </div>
  );
});

ExpandingInput.displayName = "ExpandingInput";

export { ExpandingInput };
