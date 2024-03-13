"use client";
import classnames from "classnames";
import { InputFieldProps, HTMLTextInputTypeAttribute } from "@lib/types";
import { ErrorMessage } from "@clientComponents/forms";

export interface TextInputProps extends InputFieldProps {
  type: HTMLTextInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  error: string;
}

export const TextInput = ({
  id,
  name,
  type,
  className,
  required,
  ariaDescribedBy,
  placeholder,
  autoComplete,
  error,
}: TextInputProps): React.ReactElement => {
  const classes = classnames("gc-input-text", className);
  return (
    <>
      {error && <ErrorMessage id={"errorMessage" + id}>{error}</ErrorMessage>}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete ? autoComplete : "off"}
        placeholder={placeholder}
        {...(ariaDescribedBy && { ...{ "aria-describedby": ariaDescribedBy } })}
      />
    </>
  );
};
