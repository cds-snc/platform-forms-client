import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { newResponsesExist, unConfirmedResponsesExist } from "../../actions";

/* Content boxes */
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";
import { AwatingDownlad } from "./AwatingDownlad";
import { ResponsesOkay } from "./ResponsesOkay";

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
    return <Skeleton count={1} height={160} className="mb-4 w-[280px]" />;
  }

  if (!checkingApiSubmissions && hasNewApiSubmissions) {
    // New responses exist
    return (
      <HealthCheckBox.Warning
        titleKey="systemHealth.awatingDownlad.title"
        status={<AwatingDownlad />}
      >
        <HealthCheckBox.Text i18nKey="systemHealth.awatingDownlad.description" />
      </HealthCheckBox.Warning>
    );
  }

  if (!checkingApiSubmissions && hasUnconfirmedApiSubmissions) {
    // Has unconfirmed responses
    return (
      <HealthCheckBox.Warning
        titleKey="systemHealth.awatingDownlad.title"
        status={<AwatingDownlad />}
      >
        <HealthCheckBox.Text i18nKey="systemHealth.awatingDownlad.description" />
      </HealthCheckBox.Warning>
    );
  }

  // All responses are downloaded and confirmed
  return <ResponsesOkay />;
};
