import React from "react";
import { useTranslation } from "@i18n/client";
import { ApiTooltip } from "./ApiTooltip";
import { Button } from "@clientComponents/globals";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

export const DeleteKeyButton = ({ id, keyId }: { id: string; keyId: string }) => {
  const { t } = useTranslation("form-builder");
  const { Event } = useCustomEvent();

  const openDeleteApiDialog = () => {
    Event.fire(EventKeys.openDeleteApiKeyDialog, { id });
  };

  return (
    <>
      <div className="mb-4">
        <div className="font-bold">{t("settings.api.keyId")}</div>
        {keyId} <ApiTooltip />
      </div>
      <Button theme="destructive" className="mr-4" onClick={openDeleteApiDialog}>
        {t("settings.api.deleteKey")}
      </Button>
    </>
  );
};
