import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface RequiredTextInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "name" | "number" | "password" | "search" | "tel" | "url";
}

interface CustomTextInputProps {
  className?: string;
  required?: boolean;
  ariaDescribedBy?: string;
  placeholder?: string;
}

export type OptionalTextInputProps = CustomTextInputProps & JSX.IntrinsicElements["input"];

export type TextInputProps = RequiredTextInputProps & OptionalTextInputProps;

export const TextInput = (props: TextInputProps): React.ReactElement => {
  const { id, type, className, required, ariaDescribedBy, placeholder, autoComplete, maxLength } =
    props;
  const [field, meta, helpers] = useField(props);
  const classes = classnames("gc-input-text", className);

  const [remainingCharacters, setRemainingCharacters] = useState(0);

  useEffect(() => {
    if (maxLength) {
      setRemainingCharacters(maxLength);
    }
  }, []);

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
  };

  return (
    <>
      {meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete ? autoComplete : "off"}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        {...field}
        onChange={handleTextInputChange}
      />
      {maxLength && remainingCharacters < maxLength * 0.25 && remainingCharacters >= 0 && (
        <div id="character-count-message">You have {remainingCharacters} characters left.</div>
      )}
      {maxLength && remainingCharacters < 0 && (
        <div id="character-count-message" className="gc-error-message">
          You have {remainingCharacters * -1} characters too many.
        </div>
      )}
    </>
  );
};

export default TextInput;
