"use client";;
import React from "react";
import { cn } from "@lib/utils";

interface MultipleChoiceProps {
  type: string;
  className?: string;
  label?: React.ReactElement | string;
  value: string;
  name?: string;
  id?: string;
  children?: React.ReactElement | string;
  onBlur?(...args: unknown[]): unknown;
  onChange?(...args: unknown[]): unknown;
  onFocus?(...args: unknown[]): unknown;
  checked?: boolean;
}

const MultipleChoice = ({
  label,
  value,
  name,
  id,
  children,
  className,
  type,
  onBlur,
  onChange,
  onFocus,
  checked,
  labelClassName,
  checkboxClassName,
  ...props
}: MultipleChoiceProps) => (
  <div className={cn(className, "multiple-choice-wrapper")}>
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      checked={checked}
      className={cn(checkboxClassName ? checkboxClassName : "")}
      {...props}
    />
    <label htmlFor={id} id={`${id}-label`} className={cn(labelClassName ? labelClassName : "")}>
      {label}
    </label>
    {children}
  </div>
);

const Radio = ({ ...props }) => <MultipleChoice type={"radio"} {...props} />;

const Checkbox = ({ ...props }) => <MultipleChoice type="checkbox" {...props} />;

export { Radio, Checkbox };
