"use client";
import { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";
import { formatInvalidError } from "@lib/validation/formatInvalidError";
import { getEntryQuestion } from "@lib/validation/formatErrors";
import { truncateString } from "@lib/client/clientHelpers";

interface UseWordCountOptions {
  maxWords?: number;
  id: string;
  lang?: string;
  value: unknown;
  error?: string;
  setError: (error: string | undefined) => void;
  questionLabel?: string;
}

interface UseWordCountReturn {
  updateWordError: (value: string) => void;
  hasWordError: boolean;
  ariaDescribedByIds: (hasError: boolean, ariaDescribedBy?: string) => Record<string, string>;
  WordCountDisplay: React.FC;
}

export const useWordCount = ({
  maxWords,
  id,
  lang,
  value,
  error,
  setError,
  questionLabel,
}: UseWordCountOptions): UseWordCountReturn => {
  const { t } = useTranslation("common", { lng: lang });

  const getExceededMessage = useCallback(
    (count: number) => t("formElements.wordCount.exceeded", { count }),
    [t]
  );

  const countWords = (text: string): number => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const wordCount = typeof value === "string" ? countWords(value) : 0;

  const remainingWords = (maxWords ?? 0) - wordCount;

  const hasWordLimit = Boolean(maxWords);

  const hasWordError =
    hasWordLimit &&
    remainingWords < 0 &&
    error === formatInvalidError(getExceededMessage(-remainingWords), questionLabel);

  const showRemaining =
    hasWordLimit && remainingWords < (maxWords ?? 0) * 0.25 && remainingWords >= 0;

  const showExceeded = hasWordLimit && remainingWords < 0 && !hasWordError;

  const rowIndex = id.includes(".") ? Number(id.split(".")[1]) : NaN;

  const entryNumber = Number.isInteger(rowIndex) && rowIndex >= 0 ? rowIndex + 1 : undefined;

  const hasRequiredError =
    error ===
    t("input-validation.error-list.default", {
      question: getEntryQuestion(
        truncateString(questionLabel ?? ""),
        lang === "fr" ? "fr" : "en",
        t,
        entryNumber
      ),
      interpolation: { escapeValue: false },
    });

  const updateWordError = (nextValue: string) => {
    if ((!hasWordError && !hasRequiredError) || !maxWords) return;
    const exceeded = countWords(nextValue) - maxWords;
    if (hasRequiredError && exceeded <= 0) return;
    setError(
      exceeded > 0 ? formatInvalidError(getExceededMessage(exceeded), questionLabel) : undefined
    );
  };

  const ariaDescribedByIds = useCallback(
    (hasError: boolean, ariaDescribedBy?: string): Record<string, string> => {
      const wordCountMessageId =
        showRemaining || showExceeded ? `wordCountMessage${id}` : undefined;
      const describedBy = getDescribedByIds(
        hasError ? getErrorMessageId(id) : undefined,
        wordCountMessageId,
        ariaDescribedBy
      );
      return describedBy ? { "aria-describedby": describedBy } : {};
    },
    [showRemaining, showExceeded, id]
  );

  const WordCountDisplay = useCallback(() => {
    if (!showRemaining && !showExceeded) return null;

    return (
      <div id={"wordCountMessage" + id} className="gc-error-message" aria-live="polite">
        {showRemaining && t("formElements.wordCount.remaining", { count: remainingWords })}
        {showExceeded && getExceededMessage(Math.abs(remainingWords))}
      </div>
    );
  }, [showRemaining, showExceeded, id, remainingWords, t, getExceededMessage]);

  return {
    updateWordError,
    hasWordError,
    ariaDescribedByIds,
    WordCountDisplay,
  };
};
