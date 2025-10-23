import React, { useCallback, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import { useTranslation } from "@i18n/client";

import { ClosedDetails } from "@lib/types";
import { LanguageLabel } from "@formBuilder/components/shared/LanguageLabel";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";

import { cn } from "@lib/utils";

import {
  MessageType,
  ValidationMessage,
} from "@clientComponents/globals/ValidationMessage/ValidationMessage";
import { Editor } from "@gcforms/editor";

type ClosedMessageProps = {
  valid: boolean;
  closedDetails?: ClosedDetails;
  setClosedDetails: (details: ClosedDetails) => void;
  onSave?: () => void;
};

export const ClosedMessage = ({
  valid,
  closedDetails,
  setClosedDetails,
  onSave,
}: ClosedMessageProps) => {
  const { t, i18n } = useTranslation("form-builder");
  const hasHydrated = useRehydrate();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track the initial state to detect changes (only set once on mount)
  const initialDetailsRef = useRef<ClosedDetails | undefined>(closedDetails);
  const lastSavedDetailsRef = useRef<ClosedDetails | undefined>(closedDetails);

  const hasChanged = useCallback(() => {
    const baseline = lastSavedDetailsRef.current || initialDetailsRef.current;

    if (!baseline && !closedDetails) return false;
    if (!baseline) return true;
    if (!closedDetails) return true;

    return (
      baseline.messageEn !== closedDetails.messageEn ||
      baseline.messageFr !== closedDetails.messageFr
    );
  }, [closedDetails]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (valid && hasChanged() && onSave) {
        onSave();
        // Update last saved state after save
        lastSavedDetailsRef.current = closedDetails;
      }
    }, 1000); // Save 1 second after user stops typing
  }, [valid, onSave, hasChanged, closedDetails]);

  if (!hasHydrated) {
    // Don't show the rich text editor until the form has been hydrated
    return (
      <div className="flex">
        <div className="relative w-1/2 border-1 border-r-4 border-gray-100 border-r-black">
          <div className="p-8">
            <Skeleton className="w-full" count={3} />
          </div>
        </div>
        <div className="relative w-1/2 border-1 border-gray-100">
          <div className="p-8">
            <Skeleton className="w-full" count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mb-2 font-bold">{t("closingDate.message.title")}</p>
      <p className="mb-4">{t("closingDate.message.text1")}</p>

      <div
        className={cn("mb-4 transition-opacity duration-500", !valid ? "opacity-100" : "opacity-0")}
      >
        <ValidationMessage show={!valid} messageType={MessageType.ERROR}>
          {t("closingDate.message.errors.translation")}
        </ValidationMessage>
      </div>

      {/*--------------------------------------------*
       * En editor
       *--------------------------------------------*/}
      <div className="mb-10 flex gap-px border border-gray-100">
        <div className="relative w-1/2 flex-1 border-r-4 border-black">
          <label className="sr-only" htmlFor={`closed-en`}>
            {t("english")}
          </label>
          <Editor
            id="closed-en"
            className="gc-formview gc-richText"
            locale={i18n.language}
            contentLocale="en"
            content={closedDetails && closedDetails.messageEn ? closedDetails.messageEn : ""}
            onChange={(value: string) => {
              setClosedDetails({ ...closedDetails, messageEn: value });
              debouncedSave();
            }}
          />
          <LanguageLabel id="closed-en-language" lang={"en"}>
            <>{t("english")}</>
          </LanguageLabel>
        </div>

        {/*--------------------------------------------*
         * Fr editor
         *--------------------------------------------*/}
        <div className="relative w-1/2 flex-1">
          <label className="sr-only" htmlFor={`closed-fr`}>
            {t("french")}
          </label>
          <Editor
            id="closed-fr"
            className="gc-formview gc-richText"
            locale={i18n.language}
            contentLocale="fr"
            content={closedDetails && closedDetails.messageFr ? closedDetails.messageFr : ""}
            onChange={(value: string) => {
              setClosedDetails({ ...closedDetails, messageFr: value });
              debouncedSave();
            }}
          />
          <LanguageLabel id="closed-fr-language" lang={"fr"}>
            <>{t("french")}</>
          </LanguageLabel>
        </div>
      </div>
    </>
  );
};
