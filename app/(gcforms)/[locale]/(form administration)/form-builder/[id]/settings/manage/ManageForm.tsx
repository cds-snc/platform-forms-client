"use client";

import { FormRecord } from "@lib/types";
import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./SetClosingDate";
import { FormOwnership } from "./FormOwnership";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ManageFormProps {
  formRecord?: FormRecord;
  usersAssignedToFormRecord?: User[];
  allUsers?: User[];
  canManageOwnership: boolean;
  canSetClosingDate: boolean;
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
    throw new Error("Something went wrong");
  }

  return (
    <>
      <SetClosingDate formID={id} />
      <FormOwnership
        formRecord={formRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
      />
      <DownloadForm />
    </>
  );
};
