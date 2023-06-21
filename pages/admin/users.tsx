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
import { Button } from "@components/globals";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { useSession } from "next-auth/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Dropdown } from "@components/admin/Users/Dropdown";
import { themes } from "@components/globals";

interface User {
  privileges: Privilege[];
  id: string;
  name: string | null;
  email: string | null;
  active: boolean;
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

export const updateActiveStatus = async (userID: string, active: boolean) => {
  try {
    return await axios({
      url: `/api/users`,
      method: "PUT",
      data: {
        userID,
        active,
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
      <Button type="button" theme="secondary" onClick={() => unselectUser()}>
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
  const { data: session } = useSession();
  const isCurrentUser = (user: User) => {
    return user.id === session?.user?.id;
  };

  const unselectUser = async () => {
    setSelectedUser(null);
    await refreshData();
  };
  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      {!selectedUser ? (
        <ul className="list-none p-0 m-0">
          {allUsers
            .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
            .map((user) => {
              return (
                <li
                  className="border-2 border-black rounded-md p-2 mb-4 flex flex-row max-w-xxl"
                  key={user.id}
                >
                  <div className="grow basis-1/3 m-auto p-4">
                    <h2 className="wrap text-base pb-6">{user.name}</h2>
                    <p className="mb-4">{user.email}</p>
                    <div className="">
                      {canManageUsers && !isCurrentUser(user) && !user.active && (
                        <Button
                          theme={"secondary"}
                          className="mr-2"
                          onClick={async () => {
                            await updateActiveStatus(user.id, true);
                            await refreshData();
                          }}
                        >
                          {t("activateAccount")}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end p-2">
                    {user.active && (
                      <Dropdown>
                        <DropdownMenuPrimitive.Item
                          className={`${themes.htmlLink} ${themes.base} !block mb-4 !cursor-pointer`}
                          onClick={() => setSelectedUser(user)}
                        >
                          {canManageUsers ? t("managePermissions") : t("viewPermissions")}
                        </DropdownMenuPrimitive.Item>

                        {canManageUsers && !isCurrentUser(user) && user.active && (
                          <DropdownMenuPrimitive.Item
                            className={`${themes.destructive} ${themes.base} mt-4 !block !cursor-pointer`}
                            onClick={async () => {
                              await updateActiveStatus(user.id, false);
                              await refreshData();
                            }}
                          >
                            {t("deactivateAccount")}
                          </DropdownMenuPrimitive.Item>
                        )}
                      </Dropdown>
                    )}
                  </div>
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
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "admin-users", "admin-login"]))),

      allUsers,
      allPrivileges,
    },
  };
});

export default Users;
