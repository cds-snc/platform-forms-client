import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { newResponsesExist } from "../../actions";

/* Content boxes */
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";
import { AwatingDownlad } from "./AwatingDownlad";
import { ResponsesOkay } from "./ResponsesOkay";

export const ResponsesAvailable = ({ formId }: { formId: string }) => {
  const [checkingApiSubmissions, setCheckingApiSubmissions] = useState(true);
  const [hasApiSubmissions, setHasApiSubmissions] = useState(false);

  useEffect(() => {
    const getApiSubmissions = async () => {
      const result = await newResponsesExist(formId);

      if (result === true) {
        setHasApiSubmissions(true);
      }
      setCheckingApiSubmissions(false);
    };

    getApiSubmissions();
  }, [formId]);

  if (checkingApiSubmissions) {
    return <Skeleton count={1} height={160} className="mb-4 w-[280px]" />;
  }

  if (!checkingApiSubmissions && hasApiSubmissions) {
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

  // All responses are downloaded and confirmed
  return <ResponsesOkay />;
};
