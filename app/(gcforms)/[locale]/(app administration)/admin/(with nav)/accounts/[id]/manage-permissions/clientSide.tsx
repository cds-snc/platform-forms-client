"use client";
import React, { ReactElement, useState, SetStateAction } from "react";
import axios from "axios";
import { useTranslation } from "@i18n/client";
import { Privilege } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { logMessage } from "@lib/logger";
import { Button, Alert } from "@clientComponents/globals";
import { PermissionToggle } from "app/(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-permissions/components/client/PermissionToggle";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { AppUser } from "@lib/types/user-types";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";

type PrivilegeList = Omit<Privilege, "permissions" | "priority">[];

const updatePrivilege = async (
  userID: string,
  privileges: { id: string; action: "add" | "remove" }[]
) => {
  try {
    return await axios({
      url: `/api/users`,
      method: "PUT",
      data: {
        userID,
        privileges,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

const PrivilegeList = ({
  formUser,
  privileges,
  setChangedPrivileges,
}: {
  formUser: AppUser;
  privileges: PrivilegeList;
  setChangedPrivileges: React.Dispatch<SetStateAction<{ id: string; action: "add" | "remove" }[]>>;
}) => {
  const { t, i18n } = useTranslation("admin-users");
  const [userPrivileges, setUserPrivileges] = useState(() =>
    formUser.privileges.map((privilege) => privilege.id)
  );

  const { ability } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;

  return (
    <ul className="m-0 mb-12 p-0">
      {privileges?.map((privilege) => {
        const active = userPrivileges.includes(privilege.id);
        const description =
          i18n.language === "en" ? privilege.descriptionEn : privilege.descriptionFr;
        return (
          <li key={privilege.id} className="mb-4 block max-w-lg pb-4">
            <div>
              {canManageUsers ? (
                <PermissionToggle
                  on={active}
                  onLabel={t("on")}
                  offLabel={t("off")}
                  description={description || ""}
                  handleToggle={() => {
                    setChangedPrivileges((oldState) => {
                      // If the item alreay exists in state remove it, as this brings it back to it's initial state
                      if (oldState.some((p) => p.id === privilege.id)) {
                        return oldState.filter((p) => p.id !== privilege.id);
                      } else {
                        return [
                          ...oldState,
                          { id: privilege.id, action: active ? "remove" : "add" },
                        ];
                      }
                    });
                    setUserPrivileges((oldState) => {
                      if (oldState.includes(privilege.id)) {
                        return oldState.filter((id) => id !== privilege.id);
                      } else {
                        return [...oldState, privilege.id];
                      }
                    });
                  }}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <p>{description} </p>
                  <div>{active ? t("on") : t("off")}</div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export const ManagePermissions = ({
  formUser,
  allPrivileges,
}: {
  formUser: AppUser;
  allPrivileges: PrivilegeList;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-users");
  const [message, setMessage] = useState<ReactElement | null>(null);
  const { ability } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;

  const [changedPrivileges, setChangedPrivileges] = useState<
    { id: string; action: "add" | "remove" }[]
  >([]);

  const { forceSessionUpdate } = useAccessControl();

  const save = async () => {
    setMessage(null);
    const response = await updatePrivilege(formUser.id, changedPrivileges);
    if (response && response.status === 200) {
      setMessage(
        <Alert.Success
          className="mb-4"
          focussable={true}
          title={t("responseSuccess.title")}
          dismissible={true}
          onDismiss={() => setMessage(null)}
        >
          <p>{t("responseSuccess.message")}</p>
        </Alert.Success>
      );
      return response.data;
    }

    setMessage(
      <Alert.Danger
        className="mb-4"
        focussable={true}
        title={t("responseFail.title")}
        dismissible={true}
        onDismiss={() => setMessage(null)}
      >
        <p>{t("responseFail.message")}</p>
      </Alert.Danger>
    );

    await forceSessionUpdate();
  };

  // @todo look to add actual groups for privileges vs currently using seed data + `names` to filter groups
  const userPrivileges = allPrivileges.filter(
    (privilege) => privilege.name === "Base" || privilege.name === "PublishForms"
  );

  const accountPrivileges = allPrivileges.filter(
    (privilege) =>
      privilege.name === "ManageForms" ||
      privilege.name === "ViewUserPrivileges" ||
      privilege.name === "ManageUsers"
  );

  const systemPrivileges = allPrivileges.filter(
    (privilege) =>
      privilege.name === "ViewApplicationSettings" || privilege.name === "ManageApplicationSettings"
  );

  return (
    <div>
      <BackLink href={`/${language}/admin/accounts?id=${formUser.id}`}>
        {t("backToAccounts")}
      </BackLink>
      <h1 className="mb-6 border-0">
        {formUser && <span className="block text-base">{formUser?.name}</span>}
        {formUser && <span className="block text-base font-normal">{formUser?.email}</span>}
        {t("managePermissions")}
      </h1>
      {message}
      <h2>{t("userAdministration")}</h2>
      <PrivilegeList
        formUser={formUser}
        privileges={userPrivileges}
        setChangedPrivileges={setChangedPrivileges}
      />
      <h2>{t("accountAdministration")}</h2>
      <PrivilegeList
        formUser={formUser}
        privileges={accountPrivileges}
        setChangedPrivileges={setChangedPrivileges}
      />
      <h2>{t("systemAdministration")}</h2>
      <PrivilegeList
        formUser={formUser}
        privileges={systemPrivileges}
        setChangedPrivileges={setChangedPrivileges}
      />

      {canManageUsers && (
        <Button className="mr-4" type="submit" onClick={() => save()}>
          {t("save")}
        </Button>
      )}

      <LinkButton.Secondary href={`/admin/accounts?id=${formUser.id}`}>
        {t("cancel")}
      </LinkButton.Secondary>
    </div>
  );
};
