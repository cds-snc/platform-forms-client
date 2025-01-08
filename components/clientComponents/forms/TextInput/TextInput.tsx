"use client";
import React, { useState, type JSX } from "react";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps, HTMLTextInputTypeAttribute } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

export interface TextInputProps extends InputFieldProps {
  type: HTMLTextInputTypeAttribute;
  placeholder?: string;
}

export const TextInput = (
  props: TextInputProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, type, className, required, ariaDescribedBy, placeholder, autoComplete, maxLength } =
    props;
  const [field, meta, helpers] = useField(props);
  const { t } = useTranslation("common");

  const [remainingCharacters, setRemainingCharacters] = useState(maxLength ?? 0);

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
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
    if (meta.error) returnValue.push("errorMessage" + id);
    if (maxLength && (remainingCharacters < 0 || remainingCharacters < maxLength * 0.25))
      returnValue.push("characterCountMessage" + id);
    if (ariaDescribedBy) returnValue.push(ariaDescribedBy);
    return returnValue.length > 0 ? { "aria-describedby": returnValue.join(" ") } : {};
  };

  const classes = cn("gcds-input-text", className, meta.error && "gcds-error");

  return (
    <>
      {meta.error && <ErrorMessage id={"errorMessage" + id}>{meta.error}</ErrorMessage>}
      <input
        data-testid="textInput"
        className={classes}
        id={id}
        type={type === "number" ? "text" : type}
        required={required}
        autoComplete={autoComplete ? autoComplete : "off"}
        placeholder={placeholder}
        {...ariaDescribedByIds()}
        {...field}
        onChange={handleTextInputChange}
        // Note: using inputmode=numeric over type=number for UX reasons.
        // See: #4851 and https://tinyurl.com/2p9tm5vk
        {...(type === "number" && {
          // For mobile phones to switch the keypad to numeric
          inputMode: "numeric",
          // For AT to identify the input as a number
          "aria-label": t("number"),
          // Just encase..
          spellCheck: "false",
          // Note: "onBeforeInput" and e.data could also be used but I'm not sure how cross-browser
          // consistent it is
          onKeyDown: (e) => {
            // Allow control keys
            if (
              e.key.includes("Arrow") ||
              e.key === "Backspace" ||
              e.key === "Enter" ||
              e.key === "Shift" ||
              e.key === "Tab"
            ) {
              return;
            }
            // Restrict a user from entering anything but a number
            if (!/[0-9]+/.test(e.key)) {
              e.preventDefault();
            }
          },
        })}
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
