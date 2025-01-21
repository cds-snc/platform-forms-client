import { serverTranslation } from "@i18n";
import { authCheckAndRedirect } from "@lib/actions/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { Card } from "@serverComponents/globals/card/Card";
import { redirect } from "next/navigation";
import { UserCard } from "./components/UserCard";

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["admin-accounts"]);

  const { ability } = await authCheckAndRedirect();

  const canViewUsers = checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "User" }], {
    redirect: true,
  });

  const canManageUsers = checkPrivilegesAsBoolean(ability, [{ action: "update", subject: "User" }]);

  if (!canViewUsers) {
    redirect(`/${locale}/forms`);
  }

  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentSignups = await getUsers(ability, {
    createdAt: {
      gte: from,
    },
    active: true,
  });

  const flaggedSignups = await getUsers(ability, {
    OR: [
      {
        email: {
          startsWith: "%-%@",
          not: {
            startsWith: "%.%@",
          },
        },
      },
      {
        AND: [
          {
            email: {
              not: {
                startsWith: "%-%@",
              },
            },
          },
          {
            email: {
              not: {
                startsWith: "%.%@",
              },
            },
          },
        ],
      },
    ],
  });

  return (
    <>
      <h1>{t("title")}</h1>
      {recentSignups?.length > 0 ? (
        <ul data-testid="accountsList" className="m-0 flex list-none flex-row flex-wrap gap-4 p-0">
          {recentSignups?.map((user) => {
            return (
              <div
                className="w-1/3 overflow-x-hidden rounded-md border-2 border-black p-2"
                id={`user-${user.id}`}
                key={user.id}
                data-testid={user.email}
              >
                <UserCard
                  user={user}
                  canManageUser={canManageUsers}
                  flagged={flaggedSignups.some((flaggedUser) => flaggedUser.id === user.id)}
                />
              </div>
            );
          })}
        </ul>
      ) : (
        <Card>
          <p className="text-[#748094]">No flagged users found</p>
        </Card>
      )}
    </>
  );
}
