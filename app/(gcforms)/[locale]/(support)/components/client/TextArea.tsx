import { cn } from "@lib/utils";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import type { JSX } from "react";

export interface TextAreaProps extends InputFieldProps {
  children?: React.ReactNode;
  placeholder?: string;
  error: string;
  name: string;
}

export const TextArea = ({
  id,
  name,
  className,
  required,
  children,
  placeholder,
  error,
}: TextAreaProps & JSX.IntrinsicElements["textarea"]): React.ReactElement => {
  const classes = cn("gc-textarea", className);
  return (
    <>
      {error && <ErrorMessage id={"errorMessage" + id}>{error}</ErrorMessage>}
      <textarea
        id={id}
        name={name}
        data-testid="textarea"
        className={classes}
        required={required}
        placeholder={placeholder}
      >
        {children}
      </textarea>
    </>
  );
};
