import React from "react";
import {
  HealthCheckBox,
  NumberCount,
} from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const OverdueResponses = ({ formId }: { formId: string }) => {
  return (
    <HealthCheckBox.Danger titleKey="systemHealth.overdue.title" status={<NumberCount count={1} />}>
      <HealthCheckBox.Text i18nKey="systemHealth.overdue.description" />
      {formId}
    </HealthCheckBox.Danger>
  );
};
