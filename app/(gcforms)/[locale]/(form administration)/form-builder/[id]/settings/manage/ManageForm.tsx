"use client";

import { FormRecord } from "@lib/types";
import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./SetClosingDate";
import { FormOwnership } from "./FormOwnership";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ManageFormProps {
  canManageOwnership: boolean;
  canSetClosingDate: boolean;
  formRecord?: FormRecord;
  usersAssignedToFormRecord?: User[];
  allUsers?: User[];
  id: string;
}

export const ManageForm = (props: ManageFormProps) => {
  const {
    formRecord,
    usersAssignedToFormRecord,
    allUsers,
    canManageOwnership,
    canSetClosingDate,
    id,
  } = props;

  if (!canManageOwnership) {
    return (
      <>
        {canSetClosingDate && <SetClosingDate formID={id} />}
        <DownloadForm />
      </>
    );
  }

  if (!formRecord || !usersAssignedToFormRecord || !allUsers) {
    return <ErrorPanel>There has been an error.</ErrorPanel>;
  }

  return (
    <>
      {canSetClosingDate && <SetClosingDate formID={id} />}
      <FormOwnership
        formRecord={formRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
      />
      <DownloadForm />
    </>
  );
};
