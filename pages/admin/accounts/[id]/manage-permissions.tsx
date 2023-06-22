import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import axios from "axios";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Privilege } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";

import { requireAuthentication } from "@lib/auth";
import { checkPrivileges, getAllPrivileges } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { getUser } from "@lib/users";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { Button } from "@components/globals";

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

const ManagePermissions = ({
  formUser,
  allPrivileges,
}: {
  formUser: User;
  allPrivileges: PrivilegeList;
}) => {
  const { t, i18n } = useTranslation("admin-users");
  const [userPrivileges, setUserPrivileges] = useState(() =>
    formUser.privileges.map((privilege) => privilege.id)
  );

  const [changedPrivileges, setChangedPrivileges] = useState<
    { id: string; action: "add" | "remove" }[]
  >([]);

  const { ability, forceSessionUpdate } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;

  const save = async () => {
    await updatePrivilege(formUser.id, changedPrivileges);
    await forceSessionUpdate();
  };

  return (
    <div>
      <Head>
        <title>{`${t("managePermissions")} ${formUser.name}`}</title>
      </Head>
      <h1 className="mb-10 border-0">
        {formUser.name} <br />
        {t("managePermissions")}
      </h1>
      <ul className="flex list-none flex-row flex-wrap gap-8 pb-8 pl-0">
        {allPrivileges?.map((privilege) => {
          const active = userPrivileges.includes(privilege.id);
          return (
            <li
              key={privilege.id}
              className={`flex w-72 max-w-2xl flex-col gap-2 rounded-lg border-2 p-4 hover:border-blue-hover`}
            >
              <p className="grow font-bold">
                {i18n.language === "en" ? privilege.descriptionEn : privilege.descriptionFr}
              </p>
              <div>
                {canManageUsers ? (
                  <Button
                    type="button"
                    theme="secondary"
                    className="text-sm"
                    onClick={() => {
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
                  >
                    {active ? t("disable") : t("enable")}
                  </Button>
                ) : (
                  <div className="m-auto">{active ? t("enabled") : t("disabled")}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Button className="mr-2" type="submit" onClick={() => save()}>
        {t("save")}
      </Button>
    </div>
  );
};

ManagePermissions.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
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

    const formUser = await getUser(id as string, ability);

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
