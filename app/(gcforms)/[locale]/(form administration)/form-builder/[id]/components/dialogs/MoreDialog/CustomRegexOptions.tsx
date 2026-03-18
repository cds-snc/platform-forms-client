import React, { useState, useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared/Input";
import { ErrorMessage } from "@clientComponents/forms";

const isValidRegex = (pattern: string): boolean => {
  if (!pattern) return true;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

export const CustomRegexOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [regexError, setRegexError] = useState<string | null>(null);

  const validateAndSetPattern = useCallback(
    (value: string) => {
      if (!isValidRegex(value)) {
        setRegexError(t("moreDialog.customRegex.errorInvalidRegex"));
      } else {
        setRegexError(null);
      }

      setItem({
        ...item,
        properties: {
          ...item.properties,
          validation: {
            ...item.properties.validation,
            regex: value,
            type: "custom",
            required: item.properties.validation?.required ?? false,
          },
        },
      });
    },
    [item, setItem, t]
  );

  if (item.type !== FormElementTypes.textField) {
    return null;
  }

  const error = regexError !== null;

  return (
    <>
      <section className="mb-4 mt-6">
        <Label htmlFor={`questionId-${item.id}`}>{t("moreDialog.customRegex.title")}</Label>
        <p>{t("moreDialog.customRegex.description")}</p>
        <Input
          id={`customRegexPattern-${item.id}`}
          name={`item${item.id}`}
          value={item.properties.validation?.regex || ""}
          className={`w-11/12` + (error ? " !border-red-700 outline-2 !outline-red-700" : "")}
          aria-invalid={error}
          aria-describedby={error ? `customRegexPattern-error-${item.id}` : undefined}
          onChange={(e) => validateAndSetPattern(e.target.value)}
        />
        {regexError && (
          <ErrorMessage id={`customRegexPattern-error-${item.id}`}>{regexError}</ErrorMessage>
        )}
      </section>
    </>
  );
};
