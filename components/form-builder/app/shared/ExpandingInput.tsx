import React, { FocusEventHandler } from "react";

interface Props {
  id: string;
  name?: string;
  type?: string;
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
  } = props;

  return (
    <div
      className="input-sizer stacked w-full laptop:w-3/4 mt-2 laptop:mt-0 mb-4 my-2 "
      data-value={value}
    >
      <textarea
        rows={1}
        id={id}
        className="text-base font-bold border-b-1.5 border-black-default border-solid focus:bg-gray-default focus:outline-0 !font-sans"
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
