"use client";

import { FormRecord, ClosedDetails } from "@lib/types";
import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./close/SetClosingDate";
import { FormOwnership } from "./FormOwnership";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { updateTemplateUsers } from "@formBuilder/actions";
import { ThrottlingRate } from "./ThrottlingRate";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ManageFormProps {
  nonce: string | null;
  canManageOwnership: boolean;
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
    canManageOwnership,
    canSetClosingDate,
    id,
    closedDetails,
  } = props;

  const { apiKeyId } = useFormBuilderConfig();

  if (!canManageOwnership) {
    return (
      <>
        {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
        <DownloadForm />
      </>
    );
  }

  if (!formRecord || !usersAssignedToFormRecord || !allUsers) {
    return <ErrorPanel>There has been an error.</ErrorPanel>;
  }

  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <FormOwnership
        nonce={nonce}
        formRecord={formRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
        updateTemplateUsers={updateTemplateUsers}
      />
      {canManageOwnership && apiKeyId && <ThrottlingRate formId={id} />}
      <DownloadForm />
    </>
  );
};
