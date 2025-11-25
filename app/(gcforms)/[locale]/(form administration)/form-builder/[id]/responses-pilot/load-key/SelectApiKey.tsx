"use client";

import { useCallback, useEffect } from "react";
import { useResponsesApp } from "../context";
import { useResponsesContext } from "../context/ResponsesContext";
import { LoadKey } from "./LoadKey";
import { GCFormsApiClient } from "../lib/apiClient";
import { Responses } from "../Responses";
import { LostKeyLink, LostKeyPopover } from "./LostKeyPopover";
import { ResponseActionButtons } from "./ResponseActionButtons";
import { FocusHeader } from "@root/app/(gcforms)/[locale]/(support)/components/client/FocusHeader";

export const SelectApiKey = ({ locale, id }: { locale: string; id: string }) => {
  const {
    t,
    router,
    searchParams,
    showOpenFilePicker,
    getAccessTokenFromApiKey,
    apiUrl,
    isDevelopment,
  } = useResponsesApp();

  const { apiClient, retrieveResponses, setApiClient, setPrivateApiKey, resetState, getProjectId } =
    useResponsesContext();

  // If navigation included ?reset=true, call resetState now (after navigation) and remove the param
  useEffect(() => {
    const shouldReset = searchParams?.get("reset") === "true";
    if (!shouldReset) return;

    // clear state now to avoid flashing when arriving from SelectLocation
    resetState();

    // remove reset param without adding history
    const cleanUrl = `/${locale}/form-builder/${id}/responses-pilot/load-key`;
    router.replace(cleanUrl);
  }, [searchParams, resetState, router, locale, id]);

  useEffect(() => {
    void retrieveResponses();
  }, [apiClient, retrieveResponses]);

  const handleLoadApiKey = useCallback(async () => {
    try {
      const [fileHandle] = (await showOpenFilePicker({
        multiple: false,
        excludeAcceptAllOption: true,
        types: [{ accept: { "application/json": [".json"] } }],
      } as Parameters<typeof showOpenFilePicker>[0])) as Awaited<
        ReturnType<typeof showOpenFilePicker>
      >;

      const keyFile = await fileHandle.getFile().then(async (file) => {
        const text = await file.text();
        return JSON.parse(text);
      });

      const projectId = getProjectId();
      const token = await getAccessTokenFromApiKey(keyFile, projectId);

      // Ensure the key's formId matches the current form id - unless in local development mode
      if (keyFile.formId !== id && !isDevelopment) {
        throw new Error("API key form ID does not match the current form ID.");
      }

      if (!token) {
        return false;
      }

      setApiClient(new GCFormsApiClient(keyFile.formId, apiUrl, keyFile, token, projectId));

      setPrivateApiKey(keyFile);

      return true;
    } catch (error) {
      // check for user abort - if so, don't show error toast
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      // eslint-disable-next-line no-console
      console.error("Error loading API key:", error);
      // no-op
      return false;
    }
  }, [
    setApiClient,
    setPrivateApiKey,
    id,
    showOpenFilePicker,
    getAccessTokenFromApiKey,
    apiUrl,
    isDevelopment,
    getProjectId,
  ]);

  return (
    <div>
      {!apiClient && (
        <div>
          <div className="mb-4">{t("stepOf", { current: 1, total: 3 })}</div>
          <FocusHeader headingTag="h2" dataTestId="load-key-heading">
            {t("loadKeyPage.title")}
          </FocusHeader>
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
