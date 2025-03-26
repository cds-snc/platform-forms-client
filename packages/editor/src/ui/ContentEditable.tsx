import type { JSX } from "react";

import "./ContentEditable.css";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import * as React from "react";

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
      className={className ?? "ContentEditable__root"}
      aria-placeholder={placeholder}
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      placeholder={
        <div className={placeholderClassName ?? "ContentEditable__placeholder"}>{placeholder}</div>
      }
    />
  );
}
