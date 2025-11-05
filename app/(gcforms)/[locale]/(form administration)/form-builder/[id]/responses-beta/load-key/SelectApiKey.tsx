"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { LoadKey } from "./LoadKey";
import { getAccessTokenFromApiKey } from "../lib/utils";
import { showOpenFilePicker } from "native-file-system-adapter";
import { GCFormsApiClient } from "../lib/apiClient";
import { Responses } from "../Responses";
import { LostKeyLink, LostKeyPopover } from "./LostKeyPopover";

export const SelectApiKey = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    apiClient,
    retrieveResponses,
    setApiClient,
    setPrivateApiKey,
    newFormSubmissions,
    resetState,
  } = useResponsesContext();

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

  const handleBack = () => {
    resetState();
    router.push(`/${locale}/form-builder/${id}/responses-beta`);
  };

  const handleNext = () => {
    // clean api client state before proceeding
    router.push(`/${locale}/form-builder/${id}/responses-beta/location`);
  };

  const handleCheck = async () => {
    void retrieveResponses();
  };

  const handleLoadApiKey = useCallback(async () => {
    try {
      // Simulate user key retrieval
      const [fileHandle] = await showOpenFilePicker({
        multiple: false, // default
        excludeAcceptAllOption: false, // default
      });

      const keyFile = await fileHandle.getFile().then(async (file) => {
        const text = await file.text();
        return JSON.parse(text);
      });

      const token = await getAccessTokenFromApiKey(keyFile);

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
  }, [setApiClient, setPrivateApiKey]);

  const actions = (
    <div className="mt-8 flex flex-row gap-4">
      <Button theme="secondary" onClick={handleBack}>
        {t("backToStart")}
      </Button>

      {apiClient && newFormSubmissions && newFormSubmissions.length === 0 ? (
        <Button theme="primary" onClick={handleCheck}>
          Check for new responses
        </Button>
      ) : (
        <Button
          theme="primary"
          disabled={Boolean(!apiClient || (newFormSubmissions && newFormSubmissions.length === 0))}
          onClick={handleNext}
        >
          {t("continueButton")}
        </Button>
      )}
    </div>
  );

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
          {actions}
        </div>
      )}

      {apiClient && <Responses actions={actions} />}
    </div>
  );
};
