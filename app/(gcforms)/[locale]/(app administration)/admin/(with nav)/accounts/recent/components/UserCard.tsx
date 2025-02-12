"use client";
import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { Flagged } from "./Flagged";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { OnHold } from "./OnHold";

export const UserCard = ({ user, flagged }: { user: AppUser; flagged: boolean }) => {
  const { Event } = useCustomEvent();
  const hasNote = user.notes !== null;
  return (
    <>
      <div className="p-4">
        <h2 className="text-base">{user.name}</h2>
        <p className="mb-4">{user.email}</p>
        <p className="mb-4">Date created: {user.createdAt.toLocaleDateString("en-GB")}</p>

        {hasNote && <p className="mb-2">&quot;{user.notes}&quot;</p>}

        <div className="flex gap-2">
          {flagged && <Flagged />}
          {hasNote && <OnHold />}
        </div>

        <div className="flex flex-wrap gap-2">
          {user.active && (
            <div className="mt-4 flex gap-4">
              <Button
                theme="secondary"
                onClick={() => {
                  Event.fire(EventKeys.openAddUserNoteDialog, {
                    userId: user.id,
                  });
                }}
              >
                Add note
              </Button>
              <Button
                theme="primary"
                onClick={() => {
                  Event.fire(EventKeys.openDeactivateUserDialog, {
                    userId: user.id,
                  });
                }}
              >
                Deactivate
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
