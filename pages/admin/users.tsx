import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { getUsers } from "@lib/users";
import { User } from "@lib/types";
import { Button } from "@components/forms";
import React from "react";
import { TFunction, useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";

const AdminEnable = ({ isAdmin, t }: { isAdmin: boolean; t: TFunction }) => {
  const testFn = () => {
    logMessage.info(`I'm now ${!isAdmin ? "Enabled" : "Disabled"}`);
  };
  return (
    <Button type="button" className="w-32 py-2 px-4" onClick={() => testFn()}>
      {isAdmin ? t("disable") : t("enable")}
    </Button>
  );
};

const UserRow = ({ user, t }: { user: User; t: TFunction }) => {
  return (
    <tr id={`${user.id}`} className="border-b-1">
      <td>{user.email}</td>
      <td>{user.admin ? t("true") : t("false")}</td>
      <td>
        <AdminEnable isAdmin={user.admin} t={t} />
      </td>
    </tr>
  );
};

const Users = ({ users }: { users: User[] }): React.ReactElement => {
  const { t } = useTranslation("admin-users");
  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div className="shadow-lg border-4">
        <table className="table-auto min-w-full text-center ">
          <tr className="border-b-2">
            <th>{t("email")}</th>
            <th>{t("admin")}</th>
          </tr>
          {users.map((user) => {
            return <UserRow key={user.id} user={user} t={t} />;
          })}
        </table>
      </div>
    </>
  );
};

export default Users;

export const getServerSideProps = requireAuthentication(async (context) => {
  let localeProps = {};
  if (context.locale) {
    localeProps = await serverSideTranslations(context.locale, ["common", "admin-users"]);
  }

  const users = await getUsers();

  return { props: { ...localeProps, users } };
});
