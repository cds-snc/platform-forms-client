import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { useRefresh } from "@lib/hooks";
import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { getAllPriveleges } from "@lib/priveleges";
import { Privelege } from "@prisma/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";

interface User {
  priveleges: Privelege[];
  id: string;
  name: string | null;
  email: string | null;
}

type PrivelegeList = Omit<Privelege, "permissions">[];

const updatePrivelege = async (
  userID: string,
  priveleges: [{ id: string; action: "add" | "remove" }]
) => {
  try {
    await axios({
      url: `/api/users`,
      method: "PUT",
      data: {
        userID,
        priveleges,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

const UserRow = ({ user, priveleges }: { user: User; priveleges: PrivelegeList }) => {
  const { ability, refreshAbility } = useAccessControl();
  const { i18n } = useTranslation();
  const userPrivelegeName = user.priveleges.map((privelege) => privelege.id);
  const canManageUsers = ability?.can("manage", "User") ?? false;
  const { refreshData: refreshAfterUpdate } = useRefresh();

  return (
    <tr className="border-b-1">
      <td>{user.email}</td>
      {priveleges?.map((privelege) => {
        return (
          <td key={privelege.id}>
            <label className="sr-only" htmlFor={`${user.id}-${privelege.id}`}>
              {i18n.language === "en" ? privelege.nameEn : privelege.nameFr}
            </label>
            <input
              type="checkbox"
              id={`${user.id}-${privelege.id}`}
              checked={userPrivelegeName.includes(privelege.id)}
              disabled={!canManageUsers}
              onChange={async () => {
                if (userPrivelegeName.includes(privelege.id)) {
                  await updatePrivelege(user.id, [{ id: privelege.id, action: "remove" }]);
                } else {
                  await updatePrivelege(user.id, [{ id: privelege.id, action: "add" }]);
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
  allPriveleges,
}: {
  allUsers: User[];
  allPriveleges: PrivelegeList;
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
              {allPriveleges?.map((privelege) => {
                return (
                  <th key={privelege.id}>
                    {i18n.language === "en" ? privelege.nameEn : privelege.nameFr}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => {
              return <UserRow key={user.id} user={user} priveleges={allPriveleges} />;
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
  const allPriveleges = (await getAllPriveleges(ability)).map(
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
      allPriveleges,
    },
  };
});
