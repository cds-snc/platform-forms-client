"use client";
import { useState, useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";

interface UseWordCountOptions {
  maxWords?: number;
  id: string;
  lang?: string;
}

interface UseWordCountReturn {
  setRemainingWords: (count: number) => void;
  ariaDescribedByIds: (hasError: boolean, ariaDescribedBy?: string) => Record<string, string>;
  WordCountDisplay: React.FC;
}

export const useWordCount = ({ maxWords, id, lang }: UseWordCountOptions): UseWordCountReturn => {
  const { t } = useTranslation("common", { lng: lang });
  const [remainingWords, setRemainingWords] = useState(maxWords ?? 0);

  const ariaDescribedByIds = useCallback(
    (hasError: boolean, ariaDescribedBy?: string): Record<string, string> => {
      const wordCountMessageId =
        maxWords && (remainingWords < 0 || remainingWords < maxWords * 0.25)
          ? `wordCountMessage${id}`
          : undefined;
      const describedBy = getDescribedByIds(
        hasError ? getErrorMessageId(id) : undefined,
        wordCountMessageId,
        ariaDescribedBy
      );
      return describedBy ? { "aria-describedby": describedBy } : {};
    },
    [maxWords, remainingWords, id]
  );

  const WordCountDisplay = useCallback(() => {
    if (!maxWords) return null;

    const showRemaining = remainingWords < maxWords * 0.5 && remainingWords >= 0;
    const showExceeded = remainingWords < 0;

    return (
      <div id={"wordCountMessage" + id} className="gc-error-message" aria-live="polite">
        {showRemaining && t("formElements.wordCount.remaining", { count: remainingWords })}
        {showExceeded && t("formElements.wordCount.exceeded", { count: Math.abs(remainingWords) })}
      </div>
    );
  }, [maxWords, id, remainingWords, t]);

  return {
    setRemainingWords,
    ariaDescribedByIds,
    WordCountDisplay,
  };
};
