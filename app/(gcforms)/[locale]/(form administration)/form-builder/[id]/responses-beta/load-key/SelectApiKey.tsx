"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { useResponsesContext } from "../context/ResponsesContext";
import { LoadKey } from "./LoadKey";
import { getAccessTokenFromApiKey } from "../lib/utils";
import { showOpenFilePicker } from "native-file-system-adapter";
import { GCFormsApiClient } from "../lib/apiClient";
import { Responses } from "../Responses";
import { LostKeyLink, LostKeyPopover } from "./LostKeyPopover";
import { ResponseActionButtons } from "./ResponseActionButtons";

export const SelectApiKey = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { apiClient, retrieveResponses, setApiClient, setPrivateApiKey, resetState } =
    useResponsesContext();

  // If navigation included ?reset=true, call resetState now (after navigation) and remove the param
  useEffect(() => {
    const shouldReset = searchParams?.get("reset") === "true";
    if (!shouldReset) return;

    // clear state now to avoid flashing when arriving from SelectLocation
    resetState();

    // remove reset param without adding history
    const cleanUrl = `/${locale}/form-builder/${id}/responses-beta/load-key`;
    router.replace(cleanUrl);
  }, [searchParams, resetState, router, locale, id]);

  useEffect(() => {
    void retrieveResponses();
  }, [apiClient, retrieveResponses]);

  const handleLoadApiKey = useCallback(async () => {
    try {
      const [fileHandle] = await showOpenFilePicker({
        multiple: false, // default
        excludeAcceptAllOption: false, // default
      });

      const keyFile = await fileHandle.getFile().then(async (file) => {
        const text = await file.text();
        return JSON.parse(text);
      });

      const token = await getAccessTokenFromApiKey(keyFile);

      // Ensure the key's formId matches the current form id - unless in local development mode
      if (keyFile.formId !== id && process.env.NODE_ENV !== "development") {
        throw new Error("API key form ID does not match the current form ID.");
      }

      if (!token) {
        return false;
      }

      setApiClient(
        new GCFormsApiClient(keyFile.formId, process.env.NEXT_PUBLIC_API_URL ?? "", token)
      );

      setPrivateApiKey(keyFile);

      return true;
    } catch (error) {
      // no-op
      return false;
    }
  }, [setApiClient, setPrivateApiKey, id]);

  return (
    <div>
      {!apiClient && (
        <div>
          <div className="mb-4">{t("stepOf", { current: 1, total: 3 })}</div>
          <h2>{t("loadKeyPage.title")}</h2>
          <p className="mb-4 font-medium">{t("loadKeyPage.detail")}</p>
          <LoadKey onLoadKey={handleLoadApiKey} />
          <LostKeyLink />
          <LostKeyPopover locale={locale} id={id} />
          <ResponseActionButtons />
        </div>
      )}
      {apiClient && <Responses actions={<ResponseActionButtons />} />}
    </div>
  );
};
