"use client";
import { useTranslation } from "@i18n/client";
import { PermissionToggle } from "./PermissionToggle";
import { updatePrivileges } from "../../actions";

export const Privilege = ({
  canManageUsers,
  active,
  description,
  userId,
  privilegeId,
}: {
  canManageUsers: boolean;
  active: boolean;
  description: string | null;
  userId: string;
  privilegeId: string;
}) => {
  const { t } = useTranslation("admin-users");
  return (
    <div>
      {canManageUsers ? (
        <PermissionToggle
          on={active}
          onLabel={t("on")}
          offLabel={t("off")}
          description={description || ""}
          handleToggle={async () => {
            await updatePrivileges(userId, privilegeId, active ? "remove" : "add");
          }}
        />
      ) : (
        <div className="flex items-center justify-between">
          <p>{description} </p>
          <div>{active ? t("on") : t("off")}</div>
        </div>
      )}
    </div>
  );
};
