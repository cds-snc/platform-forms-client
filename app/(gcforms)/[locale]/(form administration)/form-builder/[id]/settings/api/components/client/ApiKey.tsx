"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { CircleCheckIcon } from "@serverComponents/icons";
import {
  createServiceAccountKey,
  refreshServiceAccountKey,
  deleteServiceAccountKey,
} from "../../actions";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { ApiKeyType } from "@lib/types/form-builder-types";

const _createKey = async (templateId: string) => {
  // In the future this could be done in the browser but we'll need to verify that they key meets the requirements
  const key = await createServiceAccountKey(templateId);
  return key;
  // downloadKey(JSON.stringify(key), templateId);
};

const _refreshKey = async (templateId: string) => {
  const key = await refreshServiceAccountKey(templateId);
  downloadKey(JSON.stringify(key), templateId);
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

export const ApiKey = ({ keyExists }: { keyExists?: boolean }) => {
  const { t } = useTranslation("form-builder");
  const { id } = useParams();
  const { Event } = useCustomEvent();
  const [key, setKey] = useState<ApiKeyType | null>(null);
  if (Array.isArray(id)) return null;

  const openDialog = () => {
    Event.fire("open-api-key-dialog", {
      download: () => {
        downloadKey(JSON.stringify(key), id);
      }
    });
  };

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="mb-6">{t("settings.api.title")}</h2>
      </div>
      <div className="mb-4">
        {keyExists ? (
          <>
            <div className="mb-4">
              <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
              {t("settings.api.keyExists")}
            </div>
            <Button theme="primary" className="mr-4" onClick={() => deleteServiceAccountKey(id)}>
              {t("settings.api.deleteKey")}
            </Button>
            <Button theme="primary" onClick={() => _refreshKey(id)}>
              {t("settings.api.refreshKey")}
            </Button>
          </>
        ) : (
          <Button theme="primary" onClick={async () => {
            const key = await _createKey(id);
            setKey(key);
            openDialog();
          }
          }>
            {t("settings.api.generateKey")}
          </Button>
        )}
      </div>
    </div>
  );
};
