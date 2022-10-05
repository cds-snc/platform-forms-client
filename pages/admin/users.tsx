import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { useRefresh } from "@lib/hooks";
import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { getAllPrivelages } from "@lib/privelages";
import { Privelage } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";

interface User {
  privelages: Privelage[];
  id: string;
  name: string | null;
  email: string | null;
}

type PrivelageList = Omit<Privelage, "permissions">[];

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

const UserRow = ({ user, privelages }: { user: User; privelages: PrivelageList }) => {
  const { ability, refreshAbility } = useAccessControl();
  const { i18n } = useTranslation();
  const userPrivelageName = user.privelages.map((privelage) => privelage.id);
  const canManageUsers = ability?.can("manage", "User") ?? false;
  const { refreshData: refreshAfterUpdate } = useRefresh();

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
  allUsers,
  allPrivelages,
}: {
  allUsers: User[];
  allPrivelages: PrivelageList;
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
              return <UserRow key={user.id} user={user} privelages={allPrivelages} />;
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
  const allPrivelages = (await getAllPrivelages(ability)).map(
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
      allPrivelages,
    },
  };
});
