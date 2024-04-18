"use client";

import { FormRecord } from "@lib/types";
import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./SetClosingDate";
import { FormOwnership } from "./FormOwnership";

interface ManageFormProps {
  formRecord?: FormRecord;
  usersAssignedToFormRecord?: { id: string; name: string | null; email: string }[];
  allUsers?: { id: string; name: string | null; email: string }[];
  canManageOwnership: boolean;
  canSetClosingDate: boolean;
  id: string;
}

export const ManageForm = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
  canManageOwnership,
  canSetClosingDate,
  id,
}: ManageFormProps) => {
  if (canManageOwnership) {
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
  }

  return (
    <>
      {canSetClosingDate && <SetClosingDate formID={id} />}
      <DownloadForm />
    </>
  );
};
