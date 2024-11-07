"use client";
import { useParams } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { DeleteKeyButton } from "./DeleteKeyButton";
import { SubmitButton as GenerateApiKeyButton } from "@clientComponents/globals/Buttons/SubmitButton";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

type ApiKeyButtonProps = {
  showDelete?: boolean;
  i18nKey?: string;
};

export const ApiKeyButton = ({
  showDelete = false,
  i18nKey = "settings.api.generateKey",
}: ApiKeyButtonProps) => {
  const { t } = useTranslation("form-builder");
  const { id } = useParams();
  const { apiKeyId: keyId } = useFormBuilderConfig();

  const { Event } = useCustomEvent();

  const openDialog = () => {
    Event.fire(EventKeys.openApiKeyDialog, { id });
  };

  if (Array.isArray(id)) return null;

  if (!id) return null;

  return (
    <div className="mb-4">
      {showDelete && keyId ? (
        <DeleteKeyButton id={id} keyId={keyId} />
      ) : (
        <GenerateApiKeyButton
          loading={false}
          theme="primary"
          disabled={Boolean(keyId)}
          onClick={() => {
            openDialog();
          }}
        >
          {t(i18nKey)}
        </GenerateApiKeyButton>
      )}
    </div>
  );
};
