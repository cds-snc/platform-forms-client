"use client";

import { FormRecord, ClosedDetails } from "@lib/types";
import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./close/SetClosingDate";
import { FormOwnership } from "./FormOwnership";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { updateTemplateUsers } from "@formBuilder/actions";
import { ManageApiKey } from "./ManageApiKey";
import { ThrottlingRate } from "./ThrottlingRate";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { SetSaveAndResume } from "./saveAndResume/SetSaveAndResume";
import { SupportFlow } from "./SupportFlow";

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

  const { apiKeyId } = useFormBuilderConfig();

  if (!canManageAllForms) {
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
      <SupportFlow />
      <SetSaveAndResume formId={id} isPublished={formRecord.isPublished} />
      <FormOwnership
        nonce={nonce}
        formRecord={formRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
        updateTemplateUsers={updateTemplateUsers}
      />
      {canManageAllForms && apiKeyId && <ThrottlingRate formId={id} />}
      {canManageAllForms && formRecord.isPublished && <ManageApiKey />}
      <DownloadForm />
    </>
  );
};
