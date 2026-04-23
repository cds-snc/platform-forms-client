import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared/Input";
import { ErrorMessage } from "@clientComponents/forms";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { InfoDetails } from "../../../../components/shared/InfoDetails";
import { isSafeRegex, isValidRegex } from "@gcforms/core";

export const CustomRegexOptions = ({
  item,
  setItem,
  setIsValid,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
  setIsValid: (isValid: boolean) => void;
}) => {
  "use memo";
  const { t } = useTranslation("form-builder");
  const [regexError, setRegexError] = useState<string | null>(null);

  const elements = useTemplateStore((s) => s.form.elements);

  if (item.type !== FormElementTypes.textField) {
    return null;
  }

  const previousPatterns = (() => {
    const patterns = new Set<string>();
    for (const el of elements) {
      if (el.id !== item.id && el.properties.validation?.type === "custom") {
        const regex = el.properties.validation?.regex;
        if (regex) patterns.add(regex);
      }
      for (const sub of el.properties.subElements ?? []) {
        if (sub.id !== item.id && sub.properties.validation?.type === "custom") {
          const regex = sub.properties.validation?.regex;
          if (regex) patterns.add(regex);
        }
      }
    }
    return Array.from(patterns);
  })();

  const validateAndSetPattern = (value: string) => {
    if (!isValidRegex(value)) {
      setIsValid(false);
      setRegexError(t("moreDialog.customRegex.errorInvalidRegex"));
    } else if (!isSafeRegex(value)) {
      setIsValid(false);
      setRegexError(t("moreDialog.customRegex.errorUnsafeRegex"));
    } else {
      setIsValid(true);
      setRegexError(null);
    }

    setItem({
      ...item,
      properties: {
        ...item.properties,
        validation: {
          ...item.properties.validation,
          regex: value || undefined,
          type: value ? "custom" : undefined,
          required: item.properties.validation?.required ?? false,
        },
      },
    });
  };

  if (item.type !== FormElementTypes.textField) {
    return null;
  }

  const error = regexError !== null;

  return (
    <>
      <InfoDetails
        summary={t("moreDialog.customRegex.title")}
        className="mb-4 text-2xl font-semibold"
      >
        <section className="mt-6 mb-4">
          <div className="mb-2">
            <p>{t("moreDialog.customRegex.description")}</p>
          </div>

          <Label htmlFor={`customRegexPattern-${item.id}`}>
            {t("moreDialog.customRegex.label")}
          </Label>
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
          {previousPatterns.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-bold">{t("moreDialog.customRegex.previousPatterns")}</p>
              <ul
                className="flex list-none flex-wrap gap-2 pl-0"
                aria-label={t("moreDialog.customRegex.previousPatterns")}
              >
                {previousPatterns.map((pattern) => (
                  <li key={pattern}>
                    <button
                      type="button"
                      className="focus:outline-blue-focus rounded-lg border border-violet-800 bg-violet-100 px-2 py-1 font-mono text-sm hover:border-black hover:bg-gray-100 focus:outline focus:outline-[3px] focus:outline-offset-2"
                      onClick={() => validateAndSetPattern(pattern)}
                    >
                      {pattern}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </InfoDetails>
    </>
  );
};
