import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { User } from "next-auth";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import { Button } from "@components/forms";
import { useRefresh } from "@lib/hooks/useRefresh";
import React from "react";
import axios from "axios";
import { TFunction, useTranslation } from "next-i18next";

// We're filtering out all the undefined fields in getServerSideProps
// Extending interface locally to be easier to read
interface AuthenticatedUser extends User {
  id: number;
  admin: boolean;
}

const updateAdminValue = async (userID: number, isAdmin: boolean) => {
  return await axios({
    url: `/api/users`,
    method: "PUT",
    data: {
      userID,
      isAdmin,
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  }).catch((e) => {
    logMessage.error(e);
  });
};

const AdminEnable = ({
  isAdmin,
  t,
  user,
}: {
  isAdmin: boolean;
  t: TFunction;
  user: AuthenticatedUser;
}) => {
  const { refreshData, isRefreshing } = useRefresh([isAdmin]);
  return (
    <Button
      type="button"
      className="w-32 py-2 px-4"
      onClick={() => updateAdminValue(user.id, !isAdmin).then(() => refreshData())}
      disabled={isRefreshing}
    >
      <>
        {isAdmin ? t("disable") : t("enable")}
        <span className="sr-only">{`${t("a11y-diable-desc")} ${user.name}`}</span>
      </>
    </Button>
  );
};

interface UserRowProps {
  user: AuthenticatedUser;
}

const UserRow = ({ user }: UserRowProps) => {
  const { t } = useTranslation();
  // Logic check for user.id simplifies typescript check
  if (user.id) {
    return (
      <tr className="border-b-1">
        <td>{user.email}</td>
        <td>{user.admin ? t("true") : t("false")}</td>
        <td>
          <AdminEnable isAdmin={user.admin} user={user} t={t} />
        </td>
      </tr>
    );
  }
  return null;
};

interface UserProps {
  users: AuthenticatedUser[];
}

const Users = ({ users }: UserProps): React.ReactElement => {
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
            return <UserRow key={user.id} user={user} />;
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

  const users = (await getUsers()).filter((user) => user.id) as AuthenticatedUser[];

  return { props: { ...localeProps, users } };
});
