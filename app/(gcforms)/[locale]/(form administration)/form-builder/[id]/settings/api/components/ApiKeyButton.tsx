"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { ApiKeyType } from "@lib/types/form-builder-types";
import { deleteServiceAccountKey } from "../actions";
import { downloadKey, _createKey } from "../utils";
import { DeleteKeyButton } from "./DeleteKeyButton";

export const ApiKeyButton = ({ keyId }: { keyId?: string | false }) => {
  const { t } = useTranslation("form-builder");
  const { id } = useParams();
  const { Event } = useCustomEvent();
  const [key, setKey] = useState<ApiKeyType | null>(null);
  if (Array.isArray(id)) return null;

  const openDialog = () => {
    Event.fire(EventKeys.openApiKeyDialog, {
      download: () => {
        downloadKey(JSON.stringify(key), id);
        setKey(null);
      },
      cancel: async () => {
        await deleteServiceAccountKey(id);
        // setKey(null);
      },
    });
  };

  return (
    <div className="mb-4">
      {keyId && !key && <DeleteKeyButton id={id} keyId={keyId} />}
      {!keyId && (
        <Button
          theme="primary"
          onClick={async () => {
            const key = await _createKey(id);
            setKey(key);
            openDialog();
          }}
        >
          {t("settings.api.generateKey")}
        </Button>
      )}
    </div>
  );
};
