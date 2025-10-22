import React from "react";
import { useTranslation } from "@i18n/client";
import { ApiTooltip } from "./ApiTooltip";
import { Button } from "@clientComponents/globals";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

export const DeleteKeyButton = ({
  id,
  keyId,
  hasUnconfirmedResponses,
}: {
  id: string;
  keyId: string;
  hasUnconfirmedResponses: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const { Event } = useCustomEvent();

  const openDeleteApiDialog = () => {
    hasUnconfirmedResponses
      ? Event.fire(EventKeys.openUnconfirmedApiKeyDialog, { id, actionType: "delete" })
      : Event.fire(EventKeys.openDeleteApiKeyDialog, { id });
  };

  return (
    <div className="flex items-center gap-4">
      <Button theme="secondary" onClick={openDeleteApiDialog}>
        {t("settings.api.deleteKey")}
      </Button>
      <div className="flex items-center gap-2">
        <span className="font-bold">{t("settings.api.keyId")}</span>
        <ApiTooltip />
        <span>{keyId}</span>
      </div>
    </div>
  );
};
