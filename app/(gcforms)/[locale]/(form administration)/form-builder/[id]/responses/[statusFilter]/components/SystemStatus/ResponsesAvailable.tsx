import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { newResponsesExist } from "../../actions";

import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

import { NewResponsesExistContent } from "./NewResponsesExistContent";
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
    <HealthCheckBox.Warning
      titleKey="systemHealth.unconfirmed.title"
      status={<NewResponsesExistContent />}
    >
      <HealthCheckBox.Text i18nKey="systemHealth.unconfirmed.description" />
    </HealthCheckBox.Warning>;
  }

  return <ResponsesOkay />;
};
