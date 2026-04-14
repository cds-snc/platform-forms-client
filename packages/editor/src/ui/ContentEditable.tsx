import type { JSX } from "react";

import "./ContentEditable.css";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  className?: string;
  placeholderClassName?: string;
  placeholder: string;
  id: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
  id,
  ariaLabel,
  ariaDescribedBy,
}: Props): JSX.Element {
  return (
    <ContentEditable
      className={`${className ?? ""} gc-contenteditable`}
      aria-placeholder={placeholder}
      id={id}
      {...(ariaLabel && { "aria-label": ariaLabel })}
      {...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy })}
      placeholder={
        <div className={placeholderClassName || "gc-contenteditable-placeholder"}>
          {placeholder}
        </div>
      }
    />
  );
}
