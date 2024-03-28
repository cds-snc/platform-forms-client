"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

export const SaveButton = () => {
  const { t } = useTranslation("admin-settings");
  return (
    <Button type="submit" theme="primary" className="mr-4">
      {t("save")}
    </Button>
  );
};
