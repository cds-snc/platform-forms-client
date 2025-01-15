import { UserCard } from "./UserCard";
import { getPublishedFormsPrivilegeId, getAllUsers } from "../../actions";
import { authCheckAndThrow } from "@lib/actions";
import { serverTranslation } from "@i18n";
import { Card } from "@serverComponents/globals/card/Card";
import { ScrollHelper } from "../client/ScrollHelper";
import { authorization } from "@lib/privileges";

export const UsersList = async ({ filter }: { filter?: string }) => {
  const { ability } = await authCheckAndThrow();

  const canManageUser = await authorization
    .canManageAllUsers()
    .then(() => true)
    .catch(() => false);
  const canManageForms = await authorization
    .canManageAllForms()
    .then(() => true)
    .catch(() => false);

  const publishFormsId = await getPublishedFormsPrivilegeId();
  if (!publishFormsId) throw new Error("No publish forms privilege found in global privileges.");

  const users = await getAllUsers(filter ? filter === "active" : undefined);
  const { t } = await serverTranslation("admin-users");

  return (
    <div aria-live="polite">
      <ScrollHelper />
      {users?.length > 0 ? (
        <ul data-testid="accountsList" className="m-0 list-none p-0">
          {users?.map((user) => {
            return (
              <li
                className="mb-4 flex max-w-2xl flex-row rounded-md border-2 border-black p-2"
                id={`user-${user.id}`}
                key={user.id}
                data-testid={user.email}
              >
                <UserCard
                  user={user}
                  canManageUser={canManageUser}
                  canManageForms={canManageForms}
                  currentUserId={ability.user.id}
                  publishFormsId={publishFormsId}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <Card>
          <p className="text-[#748094]">
            {filter === "active"
              ? t("accountsFilter.noActiveAccounts")
              : t("accountsFilter.noDeactivatedAccounts")}
          </p>
        </Card>
      )}
    </div>
  );
};
