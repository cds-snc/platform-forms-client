import React from "react";
import classnames from "classnames";
import { useField } from "formik";

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

  const [field, meta] = useField(props);

  return (
    <>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
      <textarea
        data-testid="textarea"
        className={classes}
        id={id}
        ref={inputRef}
        {...inputProps}
        {...field}
      >
        {children}
      </textarea>
    </>
  );
};

export default TextArea;
