import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { CharacterCountMessages } from "@lib/types";

interface RequiredTextInputProps {
  id: string;
  name: string;
  type: "text" | "email" | "name" | "number" | "password" | "search" | "tel" | "url";
  characterCountMessages: CharacterCountMessages;
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
  const {
    id,
    type,
    className,
    required,
    ariaDescribedBy,
    placeholder,
    autoComplete,
    maxLength,
    characterCountMessages,
  } = props;
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

  const remainingCharactersMessage =
    characterCountMessages.part1 + " " + remainingCharacters + " " + characterCountMessages.part2;

  const tooManyCharactersMessage =
    characterCountMessages.part1Error +
    " " +
    remainingCharacters * -1 +
    " " +
    characterCountMessages.part2Error;

  return (
    <>
      {meta.error ? <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage> : null}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete ? autoComplete : "off"}
        aria-describedby={`${"errorMessage" + id} ${
          "characterCountMessage" + id
        } ${ariaDescribedBy}`}
        placeholder={placeholder}
        {...field}
        onChange={handleTextInputChange}
      />
      {maxLength && remainingCharacters < maxLength * 0.25 && remainingCharacters >= 0 && (
        <div id={"characterCountMessage" + id} aria-live="polite">
          {remainingCharactersMessage}
        </div>
      )}
      {maxLength && remainingCharacters < 0 && (
        <div id={"characterCountMessage" + id} className="gc-error-message" aria-live="polite">
          {tooManyCharactersMessage}
        </div>
      )}
    </>
  );
};

export default TextInput;
