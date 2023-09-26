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
        "input-sizer stacked border-b-1.5 border-solid border-slate-500 ",
        wrapperClassName
      )}
      data-value={value}
    >
      <textarea
        rows={1}
        maxLength={2000}
        id={id}
        className={cn("focus:bg-gray-default focus:outline-0 overflow-y-visible", className)}
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
      >
        {value}
      </textarea>
    </div>
  );
});

ExpandingInput.displayName = "ExpandingInput";

export { ExpandingInput };
