import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

import {
  newResponsesExist,
  unConfirmedResponsesExist,
} from "@formBuilder/[id]/responses/[[...statusFilter]]/actions";

/* Content boxes */
import { AwatingDownload } from "./AwatingDownload";
import { ResponsesOkay } from "./ResponsesOkay";
import { AwaitingConfirm } from "./AwaitingConfirm";

export const ResponsesAvailable = ({ formId }: { formId: string }) => {
  const [checkingApiSubmissions, setCheckingApiSubmissions] = useState(true);
  const [hasNewApiSubmissions, setHasNewApiSubmissions] = useState(false);
  const [hasUnconfirmedApiSubmissions, setHasUnconfirmedApiSubmissions] = useState(false);

  useEffect(() => {
    const getApiSubmissions = async () => {
      const hasNewResponses = await newResponsesExist(formId);
      const hasUnonfirmedResponses = await unConfirmedResponsesExist(formId);

      if (hasNewResponses === true) {
        setHasNewApiSubmissions(true);
      }

      if (hasUnonfirmedResponses === true) {
        setHasUnconfirmedApiSubmissions(true);
      }

      setCheckingApiSubmissions(false);
    };

    getApiSubmissions();
  }, [formId]);

  if (checkingApiSubmissions) {
    return <Skeleton count={1} height={148} className="mb-4 w-[290px]" />;
  }

  if (!checkingApiSubmissions && hasNewApiSubmissions) {
    // New responses exist
    return <AwatingDownload />;
  }

  if (!checkingApiSubmissions && hasUnconfirmedApiSubmissions) {
    // Downloaded responses exist but not confirmed
    return <AwaitingConfirm />;
  }

  // All responses are downloaded and confirmed
  return <ResponsesOkay />;
};
