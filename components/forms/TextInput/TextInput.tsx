import React from "react";
import classnames from "classnames";

type TextInputRef =
  | string
  | ((instance: HTMLInputElement | null) => void)
  | React.RefObject<HTMLInputElement>
  | null
  | undefined;

interface RequiredTextInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "number" | "password" | "search" | "tel" | "url";
}

interface CustomTextInputProps {
  className?: string;
  validationStatus?: "error" | "success";
  success?: boolean;
  inputSize?: "small" | "medium";
  inputRef?: TextInputRef;
}

export type OptionalTextInputProps = CustomTextInputProps &
  JSX.IntrinsicElements["input"];

export type TextInputProps = RequiredTextInputProps & OptionalTextInputProps;

export const TextInput = (props: TextInputProps): React.ReactElement => {
  const { id, name, type, className, inputRef, ...inputProps } = props;

  const classes = classnames("gc-input-text", className);

  return (
    <input
      data-testid="textInput"
      className={classes}
      id={id}
      name={name}
      type={type}
      ref={inputRef}
      {...inputProps}
    />
  );
};

export default TextInput;
