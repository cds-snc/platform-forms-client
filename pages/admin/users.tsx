import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { useRefresh } from "@lib/hooks";
import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { getAllPrivileges } from "@lib/privileges";
import { Privilege } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";

interface User {
  privileges: Privilege[];
  id: string;
  name: string | null;
  email: string | null;
}

type PrivilegeList = Omit<Privilege, "permissions">[];

const updatePrivilege = async (
  userID: string,
  privileges: [{ id: string; action: "add" | "remove" }]
) => {
  try {
    await axios({
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

const UserRow = ({ user, privileges }: { user: User; privileges: PrivilegeList }) => {
  const { ability, refreshAbility } = useAccessControl();
  const { i18n } = useTranslation();
  const userPrivilegeName = user.privileges.map((privilege) => privilege.id);
  const canManageUsers = ability?.can("manage", "User") ?? false;
  const { refreshData: refreshAfterUpdate } = useRefresh();

  return (
    <tr className="border-b-1">
      <td>{user.email}</td>
      {privileges?.map((privilege) => {
        return (
          <td key={privilege.id}>
            <label className="sr-only" htmlFor={`${user.id}-${privilege.id}`}>
              {i18n.language === "en" ? privilege.nameEn : privilege.nameFr}
            </label>
            <input
              type="checkbox"
              id={`${user.id}-${privilege.id}`}
              checked={userPrivilegeName.includes(privilege.id)}
              disabled={!canManageUsers}
              onChange={async () => {
                if (userPrivilegeName.includes(privilege.id)) {
                  await updatePrivilege(user.id, [{ id: privilege.id, action: "remove" }]);
                } else {
                  await updatePrivilege(user.id, [{ id: privilege.id, action: "add" }]);
                }
                await refreshAbility();
                await refreshAfterUpdate();
              }}
            />
          </td>
        );
      })}
    </tr>
  );
};

const Users = ({
  allUsers,
  allPrivileges,
}: {
  allUsers: User[];
  allPrivileges: PrivilegeList;
}): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-users");

  return (
    <>
      <h1>{t("title")}</h1>
      <div className="shadow-lg border-4">
        <table className="table-auto min-w-full text-center ">
          <thead>
            <tr className="border-b-2">
              <th>{t("email")}</th>
              {allPrivileges?.map((privilege) => {
                return (
                  <th key={privilege.id}>
                    {i18n.language === "en" ? privilege.nameEn : privilege.nameFr}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => {
              return <UserRow key={user.id} user={user} privileges={allPrivileges} />;
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Users;

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
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
