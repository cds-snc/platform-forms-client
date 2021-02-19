import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface RequiredTextInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "number" | "password" | "search" | "tel" | "url";
}

interface CustomTextInputProps {
  className?: string;
  required?: boolean;
}

export type OptionalTextInputProps = CustomTextInputProps &
  JSX.IntrinsicElements["input"];

export type TextInputProps = RequiredTextInputProps & OptionalTextInputProps;

export const TextInput = (props: TextInputProps): React.ReactElement => {
  const { id, type, className, required } = props;
  const [field, meta] = useField(props);
  const classes = classnames("gc-input-text", className);

  return (
    <>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}

      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type}
        required={required}
        {...field}
      />
    </>
  );
};

export default TextInput;
