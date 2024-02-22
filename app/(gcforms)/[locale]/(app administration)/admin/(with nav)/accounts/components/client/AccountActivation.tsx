"use client";
import { Button } from "@clientComponents/globals";
import { updateActive } from "../../actions";
import { useTranslation } from "@i18n/client";
export const AccountActivation = ({ userId }: { userId: string }) => {
  const { t } = useTranslation("admin-users");
  return (
    <Button
      theme={"secondary"}
      className="mr-2"
      onClick={async () => {
        await updateActive(userId, true);
      }}
    >
      {t("activateAccount")}
    </Button>
  );
};
