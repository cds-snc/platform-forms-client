"use client";
import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { Flagged } from "./Flagged";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { OnHold } from "./OnHold";
import { useTranslation } from "@i18n/client";

export const UserCard = ({ user, flagged }: { user: AppUser; flagged: boolean }) => {
  const { Event } = useCustomEvent();
  const { t } = useTranslation("admin-recent-signups");
  const hasNote = user.notes !== null;
  return (
    <>
      <div className="p-4">
        <h2 className="text-base">{user.name}</h2>
        <p className="mb-4">{user.email}</p>
        <p className="mb-4">
          {t("dateCreated")} {user.createdAt.toLocaleDateString("en-CA")}
        </p>

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
                {t("addNote")}
              </Button>
              <Button
                theme="primary"
                onClick={() => {
                  Event.fire(EventKeys.openDeactivateUserDialog, {
                    userId: user.id,
                  });
                }}
              >
                {t("deactivate")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
