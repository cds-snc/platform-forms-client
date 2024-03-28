import { AppUser } from "@lib/types/user-types";
import { MoreMenu } from "../client/MoreMenu";
import { PublishPermission } from "../client/PublishPermission";
import { AccountActivation } from "../client/AccountActivation";
import { ManageFormsButton } from "../client/ManageFormsButton";

export const UserCard = async ({
  user,
  canManageUser,
  currentUserId,
  publishFormsId,
}: {
  user: AppUser;
  canManageUser: boolean;
  currentUserId: string;
  publishFormsId: string;
}) => {
  const isCurrentUser = user.id === currentUserId;

  return (
    <>
      <div className="m-auto grow basis-1/3 p-4">
        <h2 className="pb-6 text-base">{user.name}</h2>
        <p className="mb-4">{user.email}</p>

        <div className="flex flex-wrap gap-2">
          {canManageUser && (
            <>
              {!isCurrentUser && !user.active && <AccountActivation userId={user.id} />}
              {user.active && (
                <div className="flex-none">
                  <PublishPermission user={user} publishFormsId={publishFormsId} />
                </div>
              )}
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
