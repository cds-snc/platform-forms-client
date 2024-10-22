"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import {
  createServiceAccountKey,
  refreshServiceAccountKey,
  deleteServiceAccountKey,
} from "../../actions";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { ApiKeyType } from "@lib/types/form-builder-types";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";

const _createKey = async (templateId: string) => {
  const key = await createServiceAccountKey(templateId);
  return key;
};

// For future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _refreshKey = async (templateId: string) => {
  const key = await refreshServiceAccountKey(templateId);
  return key;
};

const downloadKey = (key: string, templateId: string) => {
  const blob = new Blob([key], { type: "application/json" });
  const href = URL.createObjectURL(blob);

  // create "a" HTLM element with href to file
  const link = document.createElement("a");
  link.href = href;
  link.download = `${templateId}_private_api_key.json`;
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

const ApiTooltip = () => {
  const { t } = useTranslation("form-builder");

  return (
    <Tooltip.Info
      side="top"
      triggerClassName="align-middle ml-1"
      tooltipClassName="font-normal whitespace-normal"
    >
      <strong>{t("settings.api.keyIdToolTip.text1")}</strong>
      <p>{t("settings.api.keyIdToolTip.text2")}</p>
    </Tooltip.Info>
  );
};

export const ApiKey = ({ keyId }: { keyId?: string | false }) => {
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
    });
  };

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="mb-6">{t("settings.api.title")}</h2>
      </div>
      <div className="mb-4">
        {keyId && !key ? (
          <>
            <div className="mb-4">
              <div className="font-bold">{t("settings.api.keyId")}</div>
              {keyId} <ApiTooltip />
            </div>

            <Button
              theme="destructive"
              className="mr-4"
              onClick={() => deleteServiceAccountKey(id)}
            >
              {t("settings.api.deleteKey")}
            </Button>
          </>
        ) : (
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
    </div>
  );
};
