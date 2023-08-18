import React, { useState } from "react";
import classnames from "classnames";
import { useField } from "formik";
import { ErrorMessage } from "@components/forms";
import { InputFieldProps, CharacterCountMessages, HTMLTextInputTypeAttribute } from "@lib/types";

export interface TextInputProps extends InputFieldProps {
  type: HTMLTextInputTypeAttribute;
  characterCountMessages?: CharacterCountMessages;
  placeholder?: string;
}

export const TextInput = (
  props: TextInputProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
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

  const [remainingCharacters, setRemainingCharacters] = useState(maxLength ?? 0);

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
  };

  const remainingCharactersMessage = characterCountMessages
    ? characterCountMessages.part1 + " " + remainingCharacters + " " + characterCountMessages.part2
    : "";

  const tooManyCharactersMessage = characterCountMessages
    ? characterCountMessages.part1Error +
      " " +
      remainingCharacters * -1 +
      " " +
      characterCountMessages.part2Error
    : "";

  const ariaDescribedByIds = () => {
    const returnValue = [];
    if (meta.error) returnValue.push("errorMessage" + id);
    if (maxLength && (remainingCharacters < 0 || remainingCharacters < maxLength * 0.25))
      returnValue.push("characterCountMessage" + id);
    if (ariaDescribedBy) returnValue.push(ariaDescribedBy);
    return returnValue.length > 0 ? { "aria-describedby": returnValue.join(" ") } : {};
  };

  return (
    <>
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete ? autoComplete : "off"}
        placeholder={placeholder}
        {...ariaDescribedByIds()}
        {...field}
        onChange={handleTextInputChange}
      />
      {characterCountMessages &&
        maxLength &&
        remainingCharacters < maxLength * 0.25 &&
        remainingCharacters >= 0 && (
          <div id={"characterCountMessage" + id} aria-live="polite">
            {remainingCharactersMessage}
          </div>
        )}
      {characterCountMessages && maxLength && remainingCharacters < 0 && (
        <div id={"characterCountMessage" + id} className="gc-error-message" aria-live="polite">
          {tooManyCharactersMessage}
        </div>
      )}
    </>
  );
};
