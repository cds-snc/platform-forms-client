import React from "react";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const OverdueResponses = ({
  formId,
  hasOverdue,
}: {
  formId: string;
  hasOverdue: boolean;
}) => {
  if (!hasOverdue) {
    return null;
  }

  return (
    <HealthCheckBox.Danger titleKey="systemHealth.overdue.title">
      <HealthCheckBox.Text i18nKey="systemHealth.overdue.description" />
      {formId}
    </HealthCheckBox.Danger>
  );
};
