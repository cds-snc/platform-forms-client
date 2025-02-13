"use client";
import React, { FocusEventHandler } from "react";

interface Props {
  id: string;
  name?: string;
  type?: string;
  placeholder?: string;
  describedBy?: string;
  ariaLabel?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  ref?: React.RefObject<HTMLInputElement>;
  theme?: "default" | "title" | "error";
  isInvalid?: boolean;
  lang?: string;
  onBlur?: FocusEventHandler;
  onFocus?: FocusEventHandler;
  disabled?: boolean;
}

type Ref = HTMLInputElement;

const Input = React.forwardRef<Ref, Props>((props, ref) => {
  const {
    id,
    name,
    describedBy,
    ariaLabel, // Use a real <label> instead when possible
    value,
    onChange,
    onKeyDown,
    className,
    placeholder,
    min,
    max,
    type = "text",
    theme = "default",
    isInvalid = false,
    lang,
    onBlur,
    onFocus,
    disabled,
  } = props;
  const themes = {
    default:
      "py-2 px-3 my-2 rounded border-1.5 border-slate-500 border-solid focus:outline-2 focus:outline-blue-focus focus:outline focus:border-blue-focus",
    title:
      "pt-2.5 pb-1.5 px-2.5 text-base font-bold border-b-1.5 border-solid border-black-default rounded-t focus:bg-gray-default focus:outline-0",
    error:
      "py-2 px-3 my-2 rounded border-1.5 border-red-default border-solid focus:outline-2 focus:outline-red-focus focus:outline-red focus:border-red-focus",
  };

  return (
    <input
      id={id}
      name={name}
      aria-describedby={describedBy}
      aria-invalid={isInvalid ? true : false}
      type={type}
      min={min}
      {...(max !== undefined && { max })}
      className={`${className} ${themes[theme]}`}
      value={value}
      placeholder={placeholder}
      {...(ariaLabel && { "aria-label": ariaLabel })}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur && onBlur}
      onFocus={onFocus && onFocus}
      ref={ref}
      {...(lang && { lang: lang })}
      autoComplete="off"
      {...(disabled !== undefined && { disabled })}
    />
  );
});

Input.displayName = "Input";

export { Input };
