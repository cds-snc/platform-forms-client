"use client";
import { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";
import { useStructuredErrors } from "@clientComponents/forms/Form/StructuredErrors";

interface UseCharacterCountOptions {
  maxLength?: number;
  id: string;
  name: string;
  lang?: string;
  value: unknown;
}

interface UseCharacterCountReturn {
  updateCharacterError: (value: string) => void;
  hasCharacterError: boolean;
  ariaDescribedByIds: (hasError: boolean, ariaDescribedBy?: string) => Record<string, string>;
  CharacterCountDisplay: React.FC;
}

export const useCharacterCount = ({
  maxLength,
  id,
  name,
  lang,
  value,
}: UseCharacterCountOptions): UseCharacterCountReturn => {
  const { t } = useTranslation("common", { lng: lang });
  // If we don’t have error codes, show the counter without trying to manage errors
  const structuredErrors = useStructuredErrors();

  const getExceededMessage = useCallback(
    (count: number) => t("formElements.characterCount.exceeded", { count }),
    [t]
  );

  const remainingCharacters = (maxLength ?? 0) - (typeof value === "string" ? value.length : 0);

  const hasCharacterLimit = Boolean(maxLength);

  const hasCharacterError =
    hasCharacterLimit &&
    remainingCharacters < 0 &&
    structuredErrors?.getErrorCode(name) === "max-length";

  const showRemaining =
    hasCharacterLimit && remainingCharacters < (maxLength ?? 0) * 0.25 && remainingCharacters >= 0;

  const showExceeded = hasCharacterLimit && remainingCharacters < 0 && !hasCharacterError;

  const updateCharacterError = (nextValue: string) => {
    if (maxLength) structuredErrors?.updateCharacterError(name, nextValue, maxLength);
  };

  const ariaDescribedByIds = useCallback(
    (hasError: boolean, ariaDescribedBy?: string): Record<string, string> => {
      const characterCountMessageId =
        showRemaining || showExceeded ? `characterCountMessage${id}` : undefined;
      const describedBy = getDescribedByIds(
        hasError ? getErrorMessageId(id) : undefined,
        characterCountMessageId,
        ariaDescribedBy
      );
      return describedBy ? { "aria-describedby": describedBy } : {};
    },
    [showRemaining, showExceeded, id]
  );

  const CharacterCountDisplay = useCallback(() => {
    if (!showRemaining && !showExceeded) return null;

    return (
      <div id={"characterCountMessage" + id} className="gc-error-message" aria-live="polite">
        {showRemaining &&
          t("formElements.characterCount.remaining", { count: remainingCharacters })}
        {showExceeded && getExceededMessage(Math.abs(remainingCharacters))}
      </div>
    );
  }, [showRemaining, showExceeded, id, remainingCharacters, t, getExceededMessage]);

  return {
    updateCharacterError,
    hasCharacterError,
    ariaDescribedByIds,
    CharacterCountDisplay,
  };
};
