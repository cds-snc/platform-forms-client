"use client";
import { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";
import { formatInvalidError } from "@lib/validation/formatInvalidError";

interface UseCharacterCountOptions {
  maxLength?: number;
  id: string;
  lang?: string;
  value: unknown;
  error?: string;
  setError: (error: string | undefined) => void;
  questionLabel?: string;
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
  lang,
  value,
  error,
  setError,
  questionLabel,
}: UseCharacterCountOptions): UseCharacterCountReturn => {
  const { t } = useTranslation("common", { lng: lang });

  const getExceededMessage = useCallback(
    (count: number) => t("formElements.characterCount.exceeded", { count }),
    [t]
  );

  const remainingCharacters = (maxLength ?? 0) - (typeof value === "string" ? value.length : 0);

  const hasCharacterLimit = Boolean(maxLength);

  const hasCharacterError =
    hasCharacterLimit &&
    remainingCharacters < 0 &&
    error === formatInvalidError(getExceededMessage(-remainingCharacters), questionLabel);

  const showRemaining =
    hasCharacterLimit && remainingCharacters < (maxLength ?? 0) * 0.25 && remainingCharacters >= 0;

  const showExceeded = hasCharacterLimit && remainingCharacters < 0 && !hasCharacterError;

  const updateCharacterError = (nextValue: string) => {
    if (!hasCharacterError || !maxLength) return;
    const exceeded = nextValue.length - maxLength;
    setError(
      exceeded > 0 ? formatInvalidError(getExceededMessage(exceeded), questionLabel) : undefined
    );
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
