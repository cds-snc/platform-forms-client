import React, { ReactElement, useState, SetStateAction } from "react";
import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Privilege } from "@prisma/client";

import { useAccessControl } from "@lib/hooks/useAccessControl";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges, getAllPrivileges } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { getUser } from "@lib/users";
import { Button, Alert } from "@components/globals";
import { BackLink } from "@components/admin/LeftNav/BackLink";
import { PermissionToggle } from "@components/admin/Users/PermissionToggle";
import { LinkButton } from "@components/globals";
import { TwoColumnLayout } from "@components/globals/layouts";

type PrivilegeList = Omit<Privilege, "permissions">[];
interface User {
  privileges: Privilege[];
  id: string;
  name: string | null;
  email: string | null;
  active: boolean;
}

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
  formUser: User;
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

const ManagePermissions = ({
  formUser,
  allPrivileges,
}: {
  formUser: User;
  allPrivileges: PrivilegeList;
}) => {
  const { t } = useTranslation("admin-users");
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
      <Head>
        <title>{`${t("managePermissions")} ${formUser.name} ${formUser.email}`}</title>
      </Head>
      <h1 className="mb-6 border-0">
        {formUser && <span className="block text-base">{formUser?.name}</span>}
        {formUser && <span className="block text-base font-normal">{formUser?.email}</span>}
        {t("managePermissions")}
      </h1>
      {message && message}
      <h2>{t("User")}</h2>
      <PrivilegeList
        formUser={formUser}
        privileges={userPrivileges}
        setChangedPrivileges={setChangedPrivileges}
      />
      <h2>{t("Account administration")}</h2>
      <PrivilegeList
        formUser={formUser}
        privileges={accountPrivileges}
        setChangedPrivileges={setChangedPrivileges}
      />
      <h2>{t("System administration")}</h2>
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

const BackToAccounts = ({ id }: { id: string }) => {
  const { t } = useTranslation("admin-users");
  return <BackLink href={`/admin/accounts?id=${id}`}>{t("backToAccounts")}</BackLink>;
};

ManagePermissions.getLayout = (page: ReactElement) => {
  return (
    <TwoColumnLayout
      user={page.props.user}
      context="admin"
      leftColumnContent={<BackToAccounts id={page.props.formUser.id} />}
    >
      {page}
    </TwoColumnLayout>
  );
};

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, params }) => {
  checkPrivileges(
    ability,
    [
      { action: "view", subject: "User" },
      { action: "view", subject: "Privilege" },
    ],
    "all"
  );

  const id = params?.id || null;
  const { locale = "en" }: { locale?: string } = params ?? {};

  const formUser = await getUser(ability, id as string);

  const allPrivileges = (await getAllPrivileges(ability)).map(
    ({ id, name, descriptionFr, descriptionEn }) => ({
      id,
      name,
      descriptionFr,
      descriptionEn,
    })
  );

  return {
    props: {
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "admin-users", "admin-login"]))),
      formUser,
      allPrivileges,
    },
  };
});

export default ManagePermissions;
