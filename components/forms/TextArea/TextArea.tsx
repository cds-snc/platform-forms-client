import React from "react";
import classnames from "classnames";

type TextAreaRef =
  | string
  | string
  | ((instance: HTMLTextAreaElement | null) => void)
  | React.RefObject<HTMLTextAreaElement>
  | null
  | undefined;

export interface TextAreaProps {
  id: string;
  name: string;
  className?: string;
  error?: boolean;
  success?: boolean;
  children?: React.ReactNode;
  inputRef?: TextAreaRef;
}

export const TextArea = (
  props: TextAreaProps & JSX.IntrinsicElements["textarea"]
): React.ReactElement => {
  const {
    id,
    name,
    className,
    error,
    success,
    children,
    inputRef,
    ...inputProps
  } = props;

  const classes = classnames(
    "gc-textarea",
    {
      "gc-input--error": error,
      "gc-input--success": success,
    },
    className
  );

  return (
    <textarea
      data-testid="textarea"
      className={classes}
      id={id}
      name={name}
      ref={inputRef}
      {...inputProps}
    >
      {children}
    </textarea>
  );
};

export default TextArea;
