import React, { ReactElement, useState, SetStateAction, useEffect } from "react";
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
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { Alert, Button, ErrorStatus } from "@components/globals";
import { BackLink } from "@components/admin/LeftNav/BackLink";
import { PermissionToggle } from "@components/admin/Users/PermissionToggle";
import { LinkButton } from "@components/globals";
import { setStorageValue, STORAGE_KEY } from "@lib/sessionStorage";

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
        <Alert
          type={ErrorStatus.SUCCESS}
          focussable={true}
          heading={t("responseSuccess.title")}
          dismissible={true}
          onDismiss={() => setMessage(null)}
          tabIndex={0}
        >
          {t("responseSuccess.message")}
        </Alert>
      );
      return response.data;
    }

    setMessage(
      <Alert
        type={ErrorStatus.ERROR}
        focussable={true}
        heading={t("responseFail.title")}
        dismissible={true}
        onDismiss={() => setMessage(null)}
        tabIndex={0}
      >
        {t("responseFail.message")}
      </Alert>
    );

    await forceSessionUpdate();
  };

  // @todo look to add actual groups for privileges vs currently using seed data + `names` to filter groups
  const userPrivileges = allPrivileges.filter(
    (privilege) => privilege.nameEn === "Base" || privilege.nameEn === "PublishForms"
  );

  const accountPrivileges = allPrivileges.filter(
    (privilege) =>
      privilege.nameEn === "ManageForms" ||
      privilege.nameEn === "ViewUserPrivileges" ||
      privilege.nameEn === "ManageUsers"
  );

  const systemPrivileges = allPrivileges.filter(
    (privilege) =>
      privilege.nameEn === "ViewApplicationSettings" ||
      privilege.nameEn === "ManageApplicationSettings"
  );

  return (
    <div>
      <Head>
        <title>{`${t("managePermissions")} ${formUser.name} ${formUser.email}`}</title>
      </Head>
      <h1 className="mb-10 border-0">
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
    <AdminNavLayout
      user={page.props.user}
      backLink={<BackToAccounts id={page.props.formUser.id} />}
    >
      {page}
    </AdminNavLayout>
  );
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability }, params, locale }) => {
    checkPrivileges(
      ability,
      [
        { action: "view", subject: "User" },
        { action: "view", subject: "Privilege" },
      ],
      "all"
    );

    const id = params?.id || null;

    const formUser = await getUser(ability, id as string);

    const allPrivileges = (await getAllPrivileges(ability)).map(
      ({ id, nameEn, nameFr, descriptionFr, descriptionEn }) => ({
        id,
        nameEn,
        nameFr,
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
  }
);

export default ManagePermissions;
