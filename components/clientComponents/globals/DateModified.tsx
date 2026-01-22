"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

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
  const { Event } = useCustomEvent();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Listen for submission progress event
    const handleProgressUpdate = () => {
      setIsSubmitting(true);
    };

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

    // Set up event listener for submission progress
    Event.on(EventKeys.submitProgress, handleProgressUpdate);

    /*
    Set up a mutation observer to watch for the submission progress loader --- the date modified is at the layout level so we don't have an easy way to know if a submission is in progress outside of checking the DOM
    */
    const observer = new MutationObserver(checkSubmissionInProgress);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      Event.off(EventKeys.submitProgress, handleProgressUpdate);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
