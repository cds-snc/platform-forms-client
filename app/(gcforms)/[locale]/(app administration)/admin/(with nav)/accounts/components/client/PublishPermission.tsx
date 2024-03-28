"use client";
import { useTransition } from "react";
import { updatePublishing } from "../../actions";
import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { useTranslation } from "@i18n/client";

import { PleaseHold } from "@serverComponents/globals/PleaseHold";

export const PublishPermission = ({
  user,
  publishFormsId,
}: {
  user: AppUser;
  publishFormsId: string;
}) => {
  const hasPrivilege = ({
    privileges,
    privilegeName,
  }: {
    privileges: { name: string; id: string }[];
    privilegeName: string;
  }): boolean => {
    return Boolean(privileges?.find((privilege) => privilege.name === privilegeName)?.id);
  };

  const { t } = useTranslation("admin-users");
  const [isPending, startTransition] = useTransition();

  return (
    /* Lock / unlock publishing */

    <Button
      theme={"secondary"}
      onClick={async () => {
        const action = hasPrivilege({
          privileges: user.privileges,
          privilegeName: "PublishForms",
        })
          ? "remove"
          : "add";
        startTransition(() => {
          updatePublishing(user.id, publishFormsId, action);
        });
      }}
    >
      {isPending ? (
        <PleaseHold className="h-8 w-20" />
      ) : hasPrivilege({
          privileges: user.privileges,
          privilegeName: "PublishForms",
        }) ? (
        t("lockPublishing")
      ) : (
        t("unlockPublishing")
      )}
    </Button>
  );
};
