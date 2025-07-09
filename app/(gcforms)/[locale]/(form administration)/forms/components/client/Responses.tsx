"use client";

import { useEffect, useState } from "react";
import { useOnScreen } from "@lib/hooks/useOnScreen";
import {
  newResponsesExist,
  unConfirmedResponsesExist,
} from "@formBuilder/[id]/responses/[[...statusFilter]]/actions";
import { useTranslation } from "@i18n/client";

import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";

export const Responses = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("my-forms");

  const [ref, isOnScreen] = useOnScreen({ threshold: 0.75 });

  const [hasSubmissions, setHasSubmissions] = useState(false);
  const [hasUnconfirmedSubmissions, setHasUnconfirmedSubmissions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let cancelled = false;
    let checked = false;

    const getSubmissions = async () => {
      if (checked) return;
      checked = true;

      if (cancelled) return;

      setLoading(true);

      const hasNewResponses = await newResponsesExist(formId);
      const hasUnconfirmedResponses = await unConfirmedResponsesExist(formId);

      if (hasNewResponses === true) {
        setHasSubmissions(true);
      } else {
        setHasSubmissions(false);
      }

      if (hasUnconfirmedResponses === true) {
        setHasUnconfirmedSubmissions(true);
      } else {
        setHasUnconfirmedSubmissions(false);
      }

      setLoading(false);
    };

    if (isOnScreen) {
      timeoutId = setTimeout(getSubmissions, 3000); // 3 sec delay
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnScreen, formId]);

  return (
    <div className="relative ml-7 mt-2 inline-block text-sm" ref={ref}>
      {loading && (
        <div role="status" className="flex items-center justify-center ">
          <SpinnerIcon className="size-4 animate-spin fill-slate-400 text-white " />
        </div>
      )}
      {!loading && hasSubmissions && (
        <div className="text-gcds-green-700">{t("card.responses.hasNewResponses")}</div>
      )}
      {!loading && hasUnconfirmedSubmissions && (
        <div className="text-gcds-red-700">{t("card.responses.hasUnconfirmedResponses")}</div>
      )}
      {!loading && !hasSubmissions && !hasUnconfirmedSubmissions && (
        <div>{t("card.responses.noResponses")}</div>
      )}
    </div>
  );
};
