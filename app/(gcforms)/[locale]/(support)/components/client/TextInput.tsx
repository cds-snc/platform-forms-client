import { cn } from "@lib/utils";
import { InputFieldProps, HTMLTextInputTypeAttribute } from "@lib/types";
import { ErrorMessage } from "@clientComponents/forms";

export interface TextInputProps extends InputFieldProps {
  type: HTMLTextInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  error: string;
  defaultValue?: string;
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
  defaultValue,
}: TextInputProps): React.ReactElement => {
  const classes = cn("gc-input-text", className);
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
        defaultValue={defaultValue}
        {...(ariaDescribedBy && { ...{ "aria-describedby": ariaDescribedBy } })}
      />
    </>
  );
};
