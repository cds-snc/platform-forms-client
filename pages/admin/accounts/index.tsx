import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Privilege } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { useRouter } from "next/router";

import { requireAuthentication } from "@lib/auth";
import { checkPrivileges, getAllPrivileges } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { useRefresh } from "@lib/hooks";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { Dropdown } from "@components/admin/Users/Dropdown";
import { ConfirmDeactivate } from "@components/admin/Users/ConfirmDeactivate";
import { Button, themes, LinkButton } from "@components/globals";

interface User {
  privileges: Privilege[];
  id: string;
  name: string | null;
  email: string | null;
  active: boolean;
}

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

const Users = ({ allUsers }: { allUsers: User[] }): React.ReactElement => {
  const { t } = useTranslation("admin-users");
  const { ability } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;
  const { refreshData } = useRefresh();
  const { data: session } = useSession();
  const router = useRouter();
  const isCurrentUser = (user: User) => {
    return user.id === session?.user?.id;
  };

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <>
        <h1 className="mb-10 border-0">{t("title")}</h1>
        <ul className="m-0 list-none p-0">
          {allUsers
            .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
            .map((user) => {
              return (
                <li
                  className="mb-4 flex max-w-2xl flex-row rounded-md border-2 border-black p-2"
                  key={user.id}
                >
                  <div className="m-auto grow basis-1/3 p-4">
                    <h2 className="pb-6 text-base">{user.name}</h2>
                    <p className="mb-4">{user.email}</p>
                    <div className="">
                      <LinkButton.Secondary
                        href={`/admin/accounts/${user.id}/manage-forms`}
                        className="mb-2 mr-3"
                      >
                        {t("manageForms")}
                      </LinkButton.Secondary>

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
                          className={`${themes.htmlLink} ${themes.base} mb-4 !block !cursor-pointer`}
                          onClick={() => {
                            router.push({
                              pathname: `/admin/accounts/${user.id}/manage-permissions`,
                            });
                          }}
                        >
                          {canManageUsers ? t("managePermissions") : t("viewPermissions")}
                        </DropdownMenuPrimitive.Item>

                        {canManageUsers && !isCurrentUser(user) && user.active && (
                          <ConfirmDeactivate user={user} />
                        )}
                      </Dropdown>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </>
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
