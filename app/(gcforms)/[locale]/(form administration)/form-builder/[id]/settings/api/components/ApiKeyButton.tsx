"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { ApiKeyType } from "@lib/types/form-builder-types";
import { deleteServiceAccountKey } from "../actions";
import { downloadKey, _createKey } from "../utils";
import { DeleteKeyButton } from "./DeleteKeyButton";
import { SubmitButton as GenerateApiKeyButton } from "@clientComponents/globals/Buttons/SubmitButton";

type ApiKeyButtonProps = {
  keyId?: string | false;
  showDelete?: boolean;
  i18nKey?: string;
};

export const ApiKeyButton = ({
  keyId,
  showDelete = false,
  i18nKey = "settings.api.generateKey",
}: ApiKeyButtonProps) => {
  const { t } = useTranslation("form-builder");
  const { id } = useParams();

  const { Event } = useCustomEvent();
  const [pendingKey, setPendingKey] = useState<ApiKeyType | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [deletingKey, setDeletingKey] = useState(false);

  if (Array.isArray(id)) return null;

  const openDialog = () => {
    Event.fire(EventKeys.openApiKeyDialog, {
      download: () => {
        downloadKey(JSON.stringify(pendingKey), id);
        setPendingKey(null);
      },
      cancel: async () => {
        setPendingKey(null);
        setDeletingKey(true);
        // Note this will revalidate the page
        // and remove the key from the UI
        await deleteServiceAccountKey(id);
        setDeletingKey(false);
      },
    });
  };

  return (
    <div className="mb-4">
      {showDelete && keyId && !deletingKey && !pendingKey ? (
        <DeleteKeyButton id={id} keyId={keyId} />
      ) : (
        <GenerateApiKeyButton
          loading={generatingKey}
          theme="primary"
          disabled={Boolean(keyId) || pendingKey !== null}
          onClick={async () => {
            setGeneratingKey(true);
            const key = await _createKey(id);
            setPendingKey(key);
            setGeneratingKey(false);
            openDialog();
          }}
        >
          {t(i18nKey)}
        </GenerateApiKeyButton>
      )}
    </div>
  );
};
