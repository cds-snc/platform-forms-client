"use client";
import { useParams } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { DeleteKeyButton } from "./DeleteKeyButton";
import { SubmitButton as GenerateApiKeyButton } from "@clientComponents/globals/Buttons/SubmitButton";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { ResponseDeliveryHelpButtonWithApi } from "./dialogs/ResponseDeliveryHelpDialogApiWithApi";

type ApiKeyButtonProps = {
  showDelete?: boolean;
  i18nKey?: string;
  theme?: Theme;
  showHelp?: boolean;
};

export const ApiKeyButton = ({
  showDelete = false,
  i18nKey = "settings.api.generateKey",
  theme = "primary",
  showHelp = true,
}: ApiKeyButtonProps) => {
  const { t } = useTranslation("form-builder");
  const { id } = useParams();
  const { apiKeyId } = useFormBuilderConfig();

  const { Event } = useCustomEvent();

  const openDialog = () => {
    Event.fire(EventKeys.openApiKeyDialog, { id });
  };

  if (Array.isArray(id)) return null;

  if (!id) return null;

  return (
    <div className="mb-4">
      {showDelete && apiKeyId ? (
        <>
          <DeleteKeyButton id={id} keyId={apiKeyId} />
          <ResponseDeliveryHelpButtonWithApi />
        </>
      ) : (
        <>
          <GenerateApiKeyButton
            loading={false}
            theme={theme}
            disabled={Boolean(apiKeyId)}
            onClick={() => {
              openDialog();
            }}
          >
            {t(i18nKey)}
          </GenerateApiKeyButton>
          {showHelp && <ResponseDeliveryHelpButtonWithApi />}
        </>
      )}
    </div>
  );
};
