"use client";

import { FormRecord, ClosedDetails } from "@lib/types";

import { FormOwnership } from "./FormOwnership";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { updateTemplateUsers } from "@formBuilder/actions";
import { ManageApiKey } from "./ManageApiKey";
import { ThrottlingRate } from "./ThrottlingRate";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

import { FormOwnerSettings } from "./FormOwnerSettings";
import { logMessage } from "@lib/logger";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ManageFormProps {
  nonce: string | null;
  canManageAllForms: boolean;
  canSetClosingDate: boolean;
  formRecord?: FormRecord;
  usersAssignedToFormRecord?: User[];
  allUsers?: User[];
  id: string;
  closedDetails?: ClosedDetails;
}

export const ManageForm = (props: ManageFormProps) => {
  const {
    nonce,
    formRecord,
    usersAssignedToFormRecord,
    allUsers,
    canManageAllForms,
    canSetClosingDate,
    id,
    closedDetails,
  } = props;

  logMessage.info(`~~~~ManageForm formRecord=${JSON.stringify(formRecord)}`);

  const { apiKeyId } = useFormBuilderConfig();

  if (!canManageAllForms) {
    return (
      <FormOwnerSettings
        id={id}
        formRecord={formRecord}
        canSetClosingDate={canSetClosingDate}
        closedDetails={closedDetails}
      />
    );
  }

  if (!formRecord || !usersAssignedToFormRecord || !allUsers) {
    return <ErrorPanel>There has been an error.</ErrorPanel>;
  }

  return (
    <>
      <FormOwnerSettings
        id={id}
        formRecord={formRecord}
        canSetClosingDate={canSetClosingDate}
        closedDetails={closedDetails}
      />

      {/* ADMIN USER SETTINGS BELOW */}
      <FormOwnership
        nonce={nonce}
        formRecord={formRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
        updateTemplateUsers={updateTemplateUsers}
      />
      {canManageAllForms && apiKeyId && <ThrottlingRate formId={id} />}
      {canManageAllForms && formRecord.isPublished && <ManageApiKey />}
      {/* End ADMIN USER SETTINGS */}
    </>
  );
};
