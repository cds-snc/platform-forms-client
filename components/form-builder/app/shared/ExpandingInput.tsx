import React, { FocusEventHandler, useRef } from "react";
import { SpeechToText } from "@components/globals/SpeechToText";

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

  // TODO probably a better way to do this. Currently the ref is passed as a function, not an
  // actual ref. The below basically allows assiging two refs to the same element for use with
  // speechToText.
  const textRef = useRef(null);
  const wrapRef = (el) => {
    textRef.current = el;
    if (ref && ref.current) {
      return ref(el);
    }
  };

  return (
    <div
      className={`input-sizer stacked border-solid border-black border-b-1.5 ${wrapperClassName}`}
      data-value={value}
    >
      <textarea
        rows={1}
        maxLength={2000}
        id={id}
        className={` focus:bg-gray-default focus:outline-0 !font-sans ${className} overflow-y-visible`}
        name={name}
        aria-describedby={describedBy}
        aria-invalid={isInvalid ? true : false}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur && onBlur}
        ref={wrapRef}
        {...(lang && { lang: lang })}
        autoComplete="off"
      >
        {value}
      </textarea>
      <SpeechToText
        lang={lang}
        callback={(result) => {
          if (textRef && textRef.current) {
            textRef.current.value += result;
          }
        }}
      />
    </div>
  );
});

ExpandingInput.displayName = "ExpandingInput";

export { ExpandingInput };
