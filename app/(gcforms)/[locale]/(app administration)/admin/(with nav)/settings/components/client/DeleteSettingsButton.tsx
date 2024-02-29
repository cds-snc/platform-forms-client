"use client";
import { deleteSetting } from "../../actions";

import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared";
import { logMessage } from "@lib/logger";
import { useTranslation } from "react-i18next";

export const DeleteSettingsButton = ({ id }: { id: string }) => {
  const { t } = useTranslation("admin-settings");

  const deleteSettingAction = async (internalId: string) => {
    try {
      await deleteSetting(internalId);
      toast.success(t("deleted"));
    } catch (error) {
      logMessage.error(error);
      toast.error(t("error"));
    }
  };

  return (
    <Button
      type="button"
      theme="destructive"
      className="text-sm whitespace-nowrap"
      onClick={() => deleteSettingAction(id)}
    >
      {t("deleteSetting")}
    </Button>
  );
};
