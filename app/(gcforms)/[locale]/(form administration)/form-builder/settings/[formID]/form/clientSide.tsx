"use client";
import { useTranslation } from "@i18n/client";
import { Settings, FormOwnership, SetClosingDate } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";

import { FormRecord } from "@lib/types";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { useSession } from "next-auth/react";

interface AssignUsersToTemplateProps {
  formRecord: FormRecord;
  usersAssignedToFormRecord: { id: string; name: string | null; email: string }[];
  allUsers: { id: string; name: string | null; email: string }[];
  canManageOwnership: boolean;
}

export const ClientSide = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
  canManageOwnership,
}: AssignUsersToTemplateProps) => {
  const { status } = useSession();
  const { t } = useTranslation("form-builder");
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  return (
    <div className="max-w-4xl">
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation />
      {status === "authenticated" && <SetClosingDate formID={id} />}
      {canManageOwnership && (
        <FormOwnership
          formRecord={formRecord}
          usersAssignedToFormRecord={usersAssignedToFormRecord}
          allUsers={allUsers}
        />
      )}
      <Settings />
    </div>
  );
};
