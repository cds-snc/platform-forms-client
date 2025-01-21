import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { Flagged } from "./Flagged";

export const UserCard = async ({
  user,
  canManageUser,
  flagged,
}: {
  user: AppUser;
  canManageUser: boolean;
  flagged: boolean;
}) => {
  return (
    <>
      <div className="p-4">
        <h2 className="text-base">{user.name}</h2>
        <p className="mb-4">{user.email}</p>
        <p className="mb-4">Date created: {user.createdAt.toLocaleDateString("en-GB")}</p>

        {flagged && <Flagged />}

        <div className="flex flex-wrap gap-2">
          {canManageUser && (
            <>
              {user.active && (
                <div className="mt-4 flex gap-4">
                  <Button theme="secondary">Add note</Button>
                  <Button theme="primary">Deactivate</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
