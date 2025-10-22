"use client";
import { useParams } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { DeleteKeyButton } from "./DeleteKeyButton";
import { SubmitButton as GenerateApiKeyButton } from "@clientComponents/globals/Buttons/SubmitButton";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

type ApiKeyButtonProps = {
  theme?: Theme;
  showHelp?: boolean;
  hasUnconfirmedResponses: boolean;
};

export const ApiKeyButton = ({ theme = "primary", hasUnconfirmedResponses }: ApiKeyButtonProps) => {
  const { t } = useTranslation("form-builder");
  const { id } = useParams();
  const { apiKeyId, hasApiKeyId } = useFormBuilderConfig();

  const { Event } = useCustomEvent();

  const openDialog = () => {
    Event.fire(EventKeys.openApiKeyDialog, { id });
  };

  const openUnconfirmedApiKeyDialog = () => {
    Event.fire(EventKeys.openUnconfirmedApiKeyDialog, { id, actionType: "generate" });
  };

  if (Array.isArray(id)) return null;

  if (!id) return null;

  const buttonText = hasApiKeyId ? t("settings.api.refreshKey") : t("settings.api.generateKey");

  return (
    <div className="mb-4 flex">
      <GenerateApiKeyButton
        loading={false}
        className="mr-4"
        theme={theme}
        onClick={() => {
          hasUnconfirmedResponses ? openUnconfirmedApiKeyDialog() : openDialog();
        }}
      >
        {buttonText}
      </GenerateApiKeyButton>

      {hasApiKeyId && apiKeyId && (
        <DeleteKeyButton
          id={id}
          keyId={apiKeyId}
          hasUnconfirmedResponses={hasUnconfirmedResponses}
        />
      )}
    </div>
  );
};
