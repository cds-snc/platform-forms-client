"use client";
import { Button } from "@clientComponents/globals";
import { AppUser } from "@lib/types/user-types";
import { useTranslation } from "@i18n/client";
import { removeUserFlag } from "../../actions";

export const RemoveFeatureButton = ({ formUser, flag }: { formUser: AppUser; flag: string }) => {
  const { t } = useTranslation("admin-flags");

  const handleRemove = async () => {
    await removeUserFlag(formUser.id, flag);
  };

  return (
    <div>
      <Button type="button" theme="primary" className="mt-4" onClick={handleRemove}>
        {t("Remove")}
      </Button>
    </div>
  );
};
