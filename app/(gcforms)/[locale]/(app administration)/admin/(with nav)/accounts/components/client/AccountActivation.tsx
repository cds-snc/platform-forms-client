"use client";
import { useTransition } from "react";
import { Button } from "@clientComponents/globals";
import { updateActive } from "../../actions";
import { useTranslation } from "@i18n/client";
import { PleaseHold } from "@serverComponents/globals/PleaseHold";
export const AccountActivation = ({ userId }: { userId: string }) => {
  const { t } = useTranslation("admin-users");
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      theme={"secondary"}
      className="mr-2"
      onClick={async () => {
        startTransition(() => {
          updateActive(userId, true);
        });
      }}
    >
      {isPending ? <PleaseHold className="h-8 w-20" /> : t("activateAccount")}
    </Button>
  );
};
