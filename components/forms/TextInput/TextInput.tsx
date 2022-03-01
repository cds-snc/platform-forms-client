import React from "react";
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
  const { id, type, className, required, ariaDescribedBy, placeholder, autoComplete } = props;
  const [field, meta] = useField(props);
  const classes = classnames("gc-input-text", className);

  return (
    <>
      {meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        {...field}
      />
    </>
  );
};

export default TextInput;
