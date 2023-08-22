import React from "react";
import { useAccessControl } from "@lib/hooks";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { LeftNavigation } from "@components/form-builder/app";

const FormBuilderLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  useAccessControl();
  return (
    <TwoColumnLayout title={title} leftNav={<LeftNavigation />}>
      {children}
    </TwoColumnLayout>
  );
};

export default FormBuilderLayout;
