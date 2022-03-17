import React, { useEffect, useState } from "react";
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
  const { id, className, ariaDescribedBy, required, children, placeholder, maxLength } = props;

  const classes = classnames("gc-textarea", className);

  const [field, meta, helpers] = useField(props);

  const [remainingCharacters, setRemainingCharacters] = useState(0);

  useEffect(() => {
    if (maxLength) {
      setRemainingCharacters(maxLength);
    }
  }, []);

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
  };

  return (
    <>
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
      <textarea
        data-testid="textarea"
        className={classes}
        id={id}
        required={required}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        {...field}
        onChange={handleTextAreaChange}
      >
        {children}
      </textarea>
      {maxLength && remainingCharacters >= 0 && (
        <div>You have {remainingCharacters} characters left.</div>
      )}
      {maxLength && remainingCharacters < 0 && (
        <div className="gc-error-message">
          You have {remainingCharacters * -1} characters too many.
        </div>
      )}
    </>
  );
};

export default TextArea;
