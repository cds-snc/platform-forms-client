import React from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

export const DeleteKeyButton = ({
  id,
  hasUnconfirmedResponses,
  isPublished,
}: {
  id: string;
  hasUnconfirmedResponses: boolean;
  isPublished: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const { Event } = useCustomEvent();

  const openDeleteApiDialog = () => {
    isPublished && hasUnconfirmedResponses
      ? Event.fire(EventKeys.openUnconfirmedApiKeyDialog, { id, actionType: "delete" })
      : Event.fire(EventKeys.openDeleteApiKeyDialog, { id });
  };

  return (
    <Button theme="secondary" onClick={openDeleteApiDialog}>
      {t("settings.api.deleteKey")}
    </Button>
  );
};
