import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { Button } from "@components/forms";
import React, { useState } from "react";
import axios from "axios";
import { TFunction, useTranslation } from "next-i18next";
import { getAllPrivelages } from "@lib/privelages";
import { Privelage } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";

interface User {
  privelages: Privelage[];
  id: string;
  name: string | null;
  email: string | null;
}

const updatePrivelage = async (
  userID: string,
  privelages: [{ id: string; action: "add" | "remove" }]
) => {
  try {
    await axios({
      url: `/api/users`,
      method: "PUT",
      data: {
        userID,
        privelages,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

const UserRow = ({
  user,
  privelages,
  afterUpdate: refreshAfterUpdate,
}: {
  user: User;
  privelages: Privelage[];
  afterUpdate: () => Promise<void>;
}) => {
  const { ability, refreshAbility } = useAccessControl();
  const { i18n } = useTranslation();
  const userPrivelageName = user.privelages.map((privelage) => privelage.id);
  const canManageUsers = ability?.can("manage", "User") ?? false;

  return (
    <tr className="border-b-1">
      <td>{user.email}</td>
      {privelages?.map((privelage) => {
        return (
          <td key={privelage.id}>
            <label className="sr-only" htmlFor={`${user.id}-${privelage.id}`}>
              {i18n.language === "en" ? privelage.nameEn : privelage.nameFr}
            </label>
            <input
              type="checkbox"
              id={`${user.id}-${privelage.id}`}
              checked={userPrivelageName.includes(privelage.id)}
              disabled={!canManageUsers}
              onChange={async () => {
                if (userPrivelageName.includes(privelage.id)) {
                  await updatePrivelage(user.id, [{ id: privelage.id, action: "remove" }]);
                } else {
                  await updatePrivelage(user.id, [{ id: privelage.id, action: "add" }]);
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
  allUsers: _allUsers,
  allPrivelages,
}: {
  allUsers: User[];
  allPrivelages: Privelage[];
}): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-users");
  const [allUsers, setAllUsers] = useState(_allUsers);

  const refreshUserList = async () => {
    try {
      const response = await axios({
        url: `/api/users`,
        method: "GET",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      setAllUsers(response.data);
    } catch (error) {
      logMessage.error(error);
    }
  };

  return (
    <>
      <h1>{t("title")}</h1>
      <div className="shadow-lg border-4">
        <table className="table-auto min-w-full text-center ">
          <thead>
            <tr className="border-b-2">
              <th>{t("email")}</th>
              {allPrivelages?.map((privelage) => {
                return (
                  <th key={privelage.id}>
                    {i18n.language === "en" ? privelage.nameEn : privelage.nameFr}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => {
              return (
                <UserRow
                  key={user.id}
                  user={user}
                  privelages={allPrivelages}
                  afterUpdate={refreshUserList}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Users;

export const getServerSideProps = requireAuthentication(async ({ user, locale }) => {
  const allUsers = await getUsers(user.ability);
  const allPrivelages = await getAllPrivelages();

  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-users"]))),
      allUsers,
      allPrivelages,
    },
  };
});
