import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { useRefresh } from "@lib/hooks";
import React, { ReactElement, useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges, getAllPrivileges } from "@lib/privileges";
import { Privilege } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { Button } from "@components/forms";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

interface User {
  privileges: Privilege[];
  id: string;
  name: string | null;
  email: string | null;
}

type PrivilegeList = Omit<Privilege, "permissions">[];

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

const ManageUser = ({
  user,
  privileges,
  unselectUser,
}: {
  user: User;
  privileges: PrivilegeList;
  unselectUser: () => void;
}) => {
  const { t, i18n } = useTranslation("admin-users");
  const [userPrivileges, setUserPrivileges] = useState(() =>
    user.privileges.map((privilege) => privilege.id)
  );
  const [changedPrivileges, setChangedPrivileges] = useState<
    { id: string; action: "add" | "remove" }[]
  >([]);

  const { ability, forceSessionUpdate } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;

  const save = async () => {
    await updatePrivilege(user.id, changedPrivileges);
    await forceSessionUpdate();
    unselectUser();
  };

  return (
    <div>
      <Head>
        <title>{`${t("managePermissionsFor")} ${user.name}`}</title>
      </Head>
      <div className="mb-8">{`${t("managePermissionsFor")} ${user.name}`}</div>
      <ul className="flex flex-row flex-wrap gap-8 pb-8 pl-0 list-none">
        {privileges?.map((privilege) => {
          const active = userPrivileges.includes(privilege.id);
          return (
            <li
              key={privilege.id}
              className={`w-72 flex flex-col gap-2 border-2 rounded-lg p-4 hover:border-blue-hover ${
                active ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <p className="font-bold grow">
                {i18n.language === "en" ? privilege.descriptionEn : privilege.descriptionFr}
              </p>
              {canManageUsers ? (
                <Button
                  type="button"
                  className="shrink-0"
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
            </li>
          );
        })}
      </ul>
      <Button className="" type="submit" onClick={() => save()}>
        {t("save")}
      </Button>
      <Button type="button" secondary={true} onClick={() => unselectUser()}>
        {t("cancel")}
      </Button>
    </div>
  );
};

const Users = ({
  allUsers,
  allPrivileges,
}: {
  allUsers: User[];
  allPrivileges: PrivilegeList;
}): React.ReactElement => {
  const { t } = useTranslation("admin-users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { ability } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;
  const { refreshData } = useRefresh();

  const unselectUser = async () => {
    setSelectedUser(null);
    await refreshData();
  };
  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
      {!selectedUser ? (
        <ul className="list-none p-0">
          {allUsers
            .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
            .map((user) => {
              return (
                <li
                  className="border-2 hover:border-blue-hover rounded-md p-2 m-2 flex flex-row"
                  key={user.id}
                >
                  <div className="grow basis-2/3 m-auto">
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                  </div>

                  <Button
                    type="button"
                    className="w-auto rounded-md shrink-0 basis-1/3"
                    onClick={() => setSelectedUser(user)}
                  >
                    {canManageUsers ? t("managePermissions") : t("viewPermissions")}{" "}
                  </Button>
                </li>
              );
            })}
        </ul>
      ) : (
        <ManageUser unselectUser={unselectUser} user={selectedUser} privileges={allPrivileges} />
      )}
    </>
  );
};

Users.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  checkPrivileges(
    ability,
    [
      { action: "view", subject: "User" },
      { action: "view", subject: "Privilege" },
    ],
    "all"
  );
  const allUsers = await getUsers(ability);
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
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-users"]))),
      allUsers,
      allPrivileges,
    },
  };
});

export default Users;
