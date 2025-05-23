"use client";

import { useEffect, useState } from "react";
import { useOnScreen } from "@lib/hooks/useOnScreen";
import {
  newResponsesExist,
  unConfirmedResponsesExist,
} from "@formBuilder/[id]/responses/[[...statusFilter]]/actions";

export const Responses = ({ formId }: { formId: string }) => {
  const [ref, isOnScreen] = useOnScreen({ threshold: 1 });

  const [hasSubmissions, setHasSubmissions] = useState(false);
  const [hasUnconfirmedSubmissions, setHasUnconfirmedSubmissions] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let cancelled = false;

    const getSubmissions = async () => {
      const hasNewResponses = await newResponsesExist(formId);
      const hasUnconfirmedResponses = await unConfirmedResponsesExist(formId);

      if (cancelled) return;

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
    <div className="ml-2 inline-block" ref={ref}>
      {hasSubmissions && <div className="text-green-500">New responses exist</div>}
      {hasUnconfirmedSubmissions && (
        <div className="text-yellow-500">Unconfirmed responses exist</div>
      )}
    </div>
  );
};
