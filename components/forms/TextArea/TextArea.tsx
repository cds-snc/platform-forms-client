import React from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

export interface TextAreaProps {
  id: string;
  name: string;
  className?: string;
  required?: boolean;
  children?: React.ReactNode;
  ariaDescribedBy?: string;
  placeholder?: string;
}

export const TextArea = (
  props: TextAreaProps & JSX.IntrinsicElements["textarea"]
): React.ReactElement => {
  const { id, className, ariaDescribedBy, required, children, placeholder } = props;

  const classes = classnames("gc-textarea", className);

  const [field, meta] = useField(props);

  return (
    <>
      {meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <textarea
        data-testid="textarea"
        className={classes}
        id={id}
        required={required}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        {...field}
      >
        {children}
      </textarea>
    </>
  );
};

export default TextArea;
