"use client";
import { useState, useCallback } from "react";
import { useTranslation } from "@i18n/client";

interface UseCharacterCountOptions {
  maxLength?: number;
  id: string;
  lang?: string;
}

interface UseCharacterCountReturn {
  setRemainingCharacters: (count: number) => void;
  ariaDescribedByIds: (hasError: boolean, ariaDescribedBy?: string) => Record<string, string>;
  CharacterCountDisplay: React.FC;
}

export const useCharacterCount = ({
  maxLength,
  id,
  lang,
}: UseCharacterCountOptions): UseCharacterCountReturn => {
  const { t } = useTranslation("common", { lng: lang });
  const [remainingCharacters, setRemainingCharacters] = useState(maxLength ?? 0);

  const ariaDescribedByIds = useCallback(
    (hasError: boolean, ariaDescribedBy?: string): Record<string, string> => {
      const returnValue: string[] = [];
      if (hasError) returnValue.push("errorMessage" + id);
      if (maxLength && (remainingCharacters < 0 || remainingCharacters < maxLength * 0.25)) {
        returnValue.push("characterCountMessage" + id);
      }
      if (ariaDescribedBy) returnValue.push(ariaDescribedBy);
      return returnValue.length > 0 ? { "aria-describedby": returnValue.join(" ") } : {};
    },
    [maxLength, remainingCharacters, id]
  );

  const CharacterCountDisplay = useCallback(() => {
    if (!maxLength) return null;

    const showRemaining = remainingCharacters < maxLength * 0.25 && remainingCharacters >= 0;
    const showExceeded = remainingCharacters < 0;

    return (
      <div id={"characterCountMessage" + id} className="gc-error-message" aria-live="polite">
        {showRemaining &&
          t("formElements.characterCount.remaining", { count: remainingCharacters })}
        {showExceeded &&
          t("formElements.characterCount.exceeded", { count: Math.abs(remainingCharacters) })}
      </div>
    );
  }, [maxLength, id, remainingCharacters, t]);

  return {
    setRemainingCharacters,
    ariaDescribedByIds,
    CharacterCountDisplay,
  };
};
