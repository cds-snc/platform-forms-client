import React from "react";

interface Props {
  id: string;
  name?: string;
  type?: string;
  placeholder?: string;
  describedBy?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  ref?: React.RefObject<HTMLInputElement>;
  theme?: "default" | "title";
}

type Ref = HTMLInputElement;

const Input = React.forwardRef<Ref, Props>((props, ref) => {
  const {
    id,
    name,
    describedBy,
    value,
    onChange,
    onKeyDown,
    className,
    placeholder,
    min,
    type = "text",
    theme = "default",
  } = props;
  const themes = {
    default:
      "py-2 px-3 my-2 rounded border-1.5 border-black-default border-solid focus:outline-2 focus:outline-blue-focus focus:outline focus:border-blue-focus",
    title:
      "pt-2.5 pb-1.5 px-2.5 text-base font-bold border-b-1.5 border-solid border-black-default rounded-t focus:bg-gray-default focus:outline-0",
  };

  return (
    <input
      id={id}
      name={name}
      aria-describedby={describedBy}
      type={type}
      min={min}
      className={`${className} ${themes[theme]}`}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={onKeyDown}
      ref={ref}
    />
  );
});

Input.displayName = "Input";

export { Input };
