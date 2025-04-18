import { useTranslation } from "@i18n/client";
import { ClosedDetails } from "@lib/types";
import { LanguageLabel } from "@formBuilder/components/shared/LanguageLabel";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import Skeleton from "react-loading-skeleton";
import React from "react";

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
};

export const ClosedMessage = ({ valid, closedDetails, setClosedDetails }: ClosedMessageProps) => {
  const { t, i18n } = useTranslation("form-builder");
  const hasHydrated = useRehydrate();

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
      <div className="flex">
        <div className="relative w-1/2 border-1 border-r-4 border-gray-100 border-r-black">
          <label className="sr-only" htmlFor={`closed-en`}>
            {t("english")}
          </label>
          <LanguageLabel id="form-introduction-english-language" lang={"en"}>
            <>{t("english")}</>
          </LanguageLabel>
          <Editor
            id="closed-en"
            className="gc-formview gc-richText"
            locale={i18n.language}
            contentLocale="en"
            content={closedDetails && closedDetails.messageEn ? closedDetails.messageEn : ""}
            onChange={(value: string) => {
              setClosedDetails({ ...closedDetails, messageEn: value });
            }}
          />
        </div>

        <div className="relative w-1/2 border-1 border-gray-100">
          <label className="sr-only" htmlFor={`closed-fr`}>
            {t("french")}
          </label>

          <LanguageLabel id="form-introduction-english-language" lang={"fr"}>
            <>{t("french")}</>
          </LanguageLabel>
          <Editor
            id="closed-fr"
            className="gc-formview gc-richText"
            locale={i18n.language}
            contentLocale="fr"
            content={closedDetails && closedDetails.messageFr ? closedDetails.messageFr : ""}
            onChange={(value: string) => setClosedDetails({ ...closedDetails, messageFr: value })}
          />
        </div>
      </div>
    </>
  );
};
