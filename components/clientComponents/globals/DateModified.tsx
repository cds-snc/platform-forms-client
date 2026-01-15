"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

interface DateModifiedProps {
  updatedAt: string | undefined;
  isPastClosingDate?: boolean;
  step?: string;
  saveAndResume?: boolean;
}

export const DateModified = ({
  updatedAt,
  isPastClosingDate = false,
  step = "",
  saveAndResume = false,
}: DateModifiedProps) => {
  const { t } = useTranslation("common");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if submission loader is visible in DOM
    const checkSubmissionInProgress = () => {
      const loader = document.querySelector(
        '[data-id="submission-progress-loader"]'
      ) as HTMLElement | null;
      if (loader && loader.offsetParent !== null) {
        // Element is visible
        setIsSubmitting(true);
      } else {
        setIsSubmitting(false);
      }
    };

    // Set up a mutation observer to watch for the submission modal
    const observer = new MutationObserver(checkSubmissionInProgress);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!updatedAt) return null;

  // Hide if past closing date
  if (isPastClosingDate) return null;

  // Hide on confirmation step
  if (step === "confirmation") return null;

  // Hide on resume step with save and resume enabled
  if (saveAndResume && step === "resume") return null;

  // Hide during submission
  if (isSubmitting) return null;

  const date = new Date(String(updatedAt));
  const formattedDate = date.toISOString().slice(0, 10);

  return (
    <div className="gc-date-modified mt-10" id="date-modified">
      {t("dateModified")}: {formattedDate}
    </div>
  );
};
