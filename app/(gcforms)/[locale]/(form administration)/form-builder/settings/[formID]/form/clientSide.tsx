"use client";
import { useTranslation } from "@i18n/client";
import { Settings, FormOwnership, SetClosingDate } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";

import { FormRecord } from "@lib/types";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { useSession } from "next-auth/react";

interface AssignUsersToTemplateProps {
  formRecord?: FormRecord;
  usersAssignedToFormRecord?: { id: string; name: string | null; email: string }[];
  allUsers?: { id: string; name: string | null; email: string }[];
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

  // Can definitely be refactored once the parent components are refactored to server components
  if (
    canManageOwnership &&
    typeof formRecord !== "undefined" &&
    typeof usersAssignedToFormRecord !== "undefined" &&
    typeof allUsers !== "undefined"
  ) {
    return (
      <div className="max-w-4xl">
        <h1>{t("gcFormsSettings")}</h1>
        <SettingsNavigation />
        {status === "authenticated" && <SetClosingDate formID={id} />}
        <FormOwnership
          formRecord={formRecord}
          usersAssignedToFormRecord={usersAssignedToFormRecord}
          allUsers={allUsers}
        />
        <Settings />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1>{t("gcFormsSettings")}</h1>
      <SettingsNavigation />
      {status === "authenticated" && <SetClosingDate formID={id} />}
      <Settings />
    </div>
  );
};
