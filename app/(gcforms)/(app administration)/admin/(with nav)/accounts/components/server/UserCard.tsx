import { ViewTransition } from "react";
import { AppUser } from "@lib/types/user-types";
import { MoreMenu } from "../client/MoreMenu";
import { PublishPermission } from "../client/PublishPermission";
import { AccountActivation } from "../client/AccountActivation";
import { ManageFormsButton } from "../client/ManageFormsButton";
import { UserNameEmail } from "@formBuilder/components/shared/account/UserNameEmail";
import { getAccountIdentityTransitionName } from "../../lib/viewTransitions";

export const UserCard = async ({
  user,
  canManageUser,
  canManageForms,
  currentUserId,
  publishFormsId,
}: {
  user: AppUser;
  canManageUser: boolean;
  canManageForms: boolean;
  currentUserId: string;
  publishFormsId: string;
}) => {
  const isCurrentUser = user.id === currentUserId;
  const transitionName = getAccountIdentityTransitionName(user.id);

  return (
    <>
      <div className="m-auto grow basis-1/3 p-4">
        <ViewTransition name={transitionName}>
          <UserNameEmail name={user.name || ""} email={user.email} />
        </ViewTransition>

        <div className="flex flex-wrap gap-2">
          {canManageUser && (
            <>
              {!isCurrentUser && !user.active && <AccountActivation userId={user.id} />}
              {user.active && (
                <div className="flex-none">
                  <PublishPermission user={user} publishFormsId={publishFormsId} />
                </div>
              )}
            </>
          )}
          {canManageForms && (
            <>
              <div className="flex-none">
                <ManageFormsButton userId={user.id} />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-end p-2" data-testid="managePermissionsDropdown">
        <MoreMenu canManageUser={canManageUser} isCurrentUser={isCurrentUser} user={user} />
      </div>
    </>
  );
};
