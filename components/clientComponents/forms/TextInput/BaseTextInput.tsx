"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { ErrorMessage } from "@clientComponents/forms";
import { HTMLTextInputTypeAttribute } from "@lib/types";

export interface BaseTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  type: HTMLTextInputTypeAttribute;
  error?: string;
  ariaDescribedBy?: string;
  allowNegativeNumbers?: boolean;
}

export const BaseTextInput = React.forwardRef<HTMLInputElement, BaseTextInputProps>(
  (
    {
      id,
      type,
      className,
      required,
      ariaDescribedBy,
      placeholder,
      autoComplete,
      maxLength,
      spellCheck,
      allowNegativeNumbers,
      error,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation("common");

    const valueLength = rest.value?.toString().length ?? 0;
    const remainingCharacters = maxLength ? maxLength - valueLength : 0;

    const characterCountMessages = {
      part1: t("formElements.characterCount.part1"),
      part2: t("formElements.characterCount.part2"),
      part1Error: t("formElements.characterCount.part1-error"),
      part2Error: t("formElements.characterCount.part2-error"),
    };

    const remainingCharactersMessage = `${characterCountMessages.part1} ${remainingCharacters} ${characterCountMessages.part2}`;
    const tooManyCharactersMessage = `${characterCountMessages.part1Error} ${
      remainingCharacters * -1
    } ${characterCountMessages.part2Error}`;

    const ariaDescribedByIds = () => {
      const ids = [];
      if (error) ids.push(`errorMessage${id}`);
      if (maxLength && (remainingCharacters < 0 || remainingCharacters < maxLength * 0.25)) {
        ids.push(`characterCountMessage${id}`);
      }
      if (ariaDescribedBy) ids.push(ariaDescribedBy);
      return ids.length > 0 ? ids.join(" ") : undefined;
    };

    const checkNumericValues = (key: string, currentTarget: EventTarget & HTMLInputElement) => {
      if (!allowNegativeNumbers) {
        if (!/[0-9]+/.test(key)) return false;
      } else {
        const { value, selectionStart } = currentTarget;
        const isLeadingMinus = key === "-" && selectionStart === 0 && !value.includes("-");
        if (!/^\d$/.test(key) && !isLeadingMinus) return false;
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type !== "number") return;
      if (["Arrow", "Backspace", "Enter", "Shift", "Tab"].some((k) => e.key.includes(k))) return;
      if (checkNumericValues(e.key, e.currentTarget) === false) {
        e.preventDefault();
      }
    };

    const classes = cn("gcds-input-text", className, error && "gcds-error");

    return (
      <>
        {error && <ErrorMessage id={`errorMessage${id}`}>{error}</ErrorMessage>}
        {type === "number" && (
          <div id={`${id}-description-number`} hidden>
            {t("number")}
          </div>
        )}
        <input
          ref={ref}
          data-testid="textInput"
          className={classes}
          id={id}
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "numeric" : undefined}
          spellCheck={spellCheck}
          required={required}
          autoComplete={autoComplete ?? "off"}
          placeholder={placeholder}
          aria-describedby={ariaDescribedByIds()}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        <div id={`characterCountMessage${id}`} aria-live="polite">
          {maxLength &&
            remainingCharacters < maxLength * 0.25 &&
            remainingCharacters >= 0 &&
            remainingCharactersMessage}
          {maxLength && remainingCharacters < 0 && tooManyCharactersMessage}
        </div>
      </>
    );
  }
);

BaseTextInput.displayName = "BaseTextInput";
