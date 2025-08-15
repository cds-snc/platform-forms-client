"use client";
import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { useTranslation } from "@i18n/client";
import { removeUserFlag } from "../../actions";
import { useSession } from "next-auth/react";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

export const RemoveFeatureButton = ({ formUser, flag }: { formUser: AppUser; flag: string }) => {
  const { t } = useTranslation("admin-flags");
  const { update: updateSession } = useSession();
  const { update: updateFlags } = useFeatureFlags();

  const handleRemove = async () => {
    await removeUserFlag(formUser.id, flag);
    await updateSession();
    await updateFlags();
  };

  return (
    <div>
      <Button type="button" theme="primary" className="mt-4" onClick={handleRemove}>
        {t("remove")}
      </Button>
    </div>
  );
};
