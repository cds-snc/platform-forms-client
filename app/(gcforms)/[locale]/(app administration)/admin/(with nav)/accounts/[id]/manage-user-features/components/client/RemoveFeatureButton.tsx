"use client";
import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { useTranslation } from "@i18n/client";
import { removeUserFlag } from "../../actions";
import { useSession } from "next-auth/react";

export const RemoveFeatureButton = ({ formUser, flag }: { formUser: AppUser; flag: string }) => {
  const { t } = useTranslation("admin-flags");
  const { update: updateSession } = useSession();

  const handleRemove = async () => {
    await removeUserFlag(formUser.id, flag);
    await updateSession();
  };

  return (
    <div>
      <Button type="button" theme="primary" className="mt-4" onClick={handleRemove}>
        {t("remove")}
      </Button>
    </div>
  );
};
