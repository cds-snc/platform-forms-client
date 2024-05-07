import React, { useState } from "react";
import classnames from "classnames";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps, HTMLTextInputTypeAttribute } from "@lib/types";
import { useTranslation } from "@i18n/client";

export interface TextInputProps extends InputFieldProps {
  type: HTMLTextInputTypeAttribute;
  placeholder?: string;
  validationError?: string;
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
    validationError,
  } = props;
  const classes = classnames("gc-input-text", className);
  const { t } = useTranslation("common");

  const [remainingCharacters, setRemainingCharacters] = useState(maxLength ?? 0);

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
  };

  const characterCountMessages = {
    part1: t("formElements.characterCount.part1"),
    part2: t("formElements.characterCount.part2"),
    part1Error: t("formElements.characterCount.part1-error"),
    part2Error: t("formElements.characterCount.part2-error"),
  };

  const remainingCharactersMessage =
    characterCountMessages.part1 + " " + remainingCharacters + " " + characterCountMessages.part2;

  const tooManyCharactersMessage =
    characterCountMessages.part1Error +
    " " +
    remainingCharacters * -1 +
    " " +
    characterCountMessages.part2Error;

  const ariaDescribedByIds = () => {
    const returnValue = [];
    if (validationError) returnValue.push("errorMessage" + id);
    if (maxLength && (remainingCharacters < 0 || remainingCharacters < maxLength * 0.25))
      returnValue.push("characterCountMessage" + id);
    if (ariaDescribedBy) returnValue.push(ariaDescribedBy);
    return returnValue.length > 0 ? { "aria-describedby": returnValue.join(" ") } : {};
  };

  return (
    <>
      {validationError && <ErrorMessage id={"errorMessage" + id}>{validationError}</ErrorMessage>}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete ? autoComplete : "off"}
        placeholder={placeholder}
        {...ariaDescribedByIds()}
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
