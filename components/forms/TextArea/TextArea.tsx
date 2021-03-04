import React from "react";
import classnames from "classnames";
import { useField } from "formik";

export interface TextAreaProps {
  id: string;
  name: string;
  className?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export const TextArea = (
  props: TextAreaProps & JSX.IntrinsicElements["textarea"]
): React.ReactElement => {
  const { id, className, required, children } = props;

  const classes = classnames("gc-textarea", className);

  const [field, meta] = useField(props);

  return (
    <>
      {meta.touched && meta.error ? <div className="error">{meta.error}</div> : null}
      <textarea data-testid="textarea" className={classes} id={id} required={required} {...field}>
        {children}
      </textarea>
    </>
  );
};

export default TextArea;
