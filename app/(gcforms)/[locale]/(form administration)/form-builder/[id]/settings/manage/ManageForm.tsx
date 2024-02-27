"use client";
import { FormOwnership, SetClosingDate } from "@formBuilder/components";
import { FormRecord } from "@lib/types";
import { useSession } from "next-auth/react";
import { useRehydrate } from "@lib/hooks/form-builder";
import { DownloadForm } from "./DownloadForm";

interface AssignUsersToTemplateProps {
  formRecord?: FormRecord;
  usersAssignedToFormRecord?: { id: string; name: string | null; email: string }[];
  allUsers?: { id: string; name: string | null; email: string }[];
  canManageOwnership: boolean;
  id: string;
}

export const ManageForm = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
  canManageOwnership,
  id,
}: AssignUsersToTemplateProps) => {
  const { status } = useSession();

  const hasHydrated = useRehydrate();
  if (!hasHydrated) return null;

  // Can definitely be refactored once the parent components are refactored to server components
  if (
    canManageOwnership &&
    typeof formRecord !== "undefined" &&
    typeof usersAssignedToFormRecord !== "undefined" &&
    typeof allUsers !== "undefined"
  ) {
    return (
      <>
        {status === "authenticated" && <SetClosingDate formID={id} />}
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
      {status === "authenticated" && <SetClosingDate formID={id} />}
      <DownloadForm />
    </>
  );
};
