"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { LoadKey } from "./LoadKey";
import { getAccessTokenFromApiKey } from "../lib/utils";
import { showOpenFilePicker } from "native-file-system-adapter";
import { GCFormsApiClient } from "../lib/apiClient";
import { Responses } from "./Responses";
import { LostKeyLink, LostKeyPopover } from "./LostKeyPopover";

export const SelectApiKey = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const router = useRouter();
  const { apiClient, retrieveResponses, setApiClient, setUserKey, newFormSubmissions, resetState } =
    useResponsesContext();

  const [hasCheckedForResponses, setHasCheckedForResponses] = useState(false);
  const [didSetUserKey, setDidSetUserKey] = useState(false);

  // When we set the user key, run retrieveResponses afterwards (acts as a "callback" to the setter)
  useEffect(() => {
    if (!didSetUserKey) return;

    let mounted = true;
    (async () => {
      try {
        await retrieveResponses();
        if (mounted) setHasCheckedForResponses(true);
      } finally {
        if (mounted) setDidSetUserKey(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [didSetUserKey, retrieveResponses]);

  const handleBack = () => {
    resetState();
    router.push(`/${locale}/form-builder/${id}/responses-beta`);
  };

  const handleNext = () => {
    // clean api client state before proceeding
    router.push(`/${locale}/form-builder/${id}/responses-beta/location`);
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

      setUserKey(keyFile);
      setDidSetUserKey(true);

      return true;
    } catch (error) {
      // no-op
      return false;
    }
  }, [setApiClient, setUserKey]);

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
        </div>
      )}

      {apiClient && <Responses hasCheckedForResponses={hasCheckedForResponses} />}

      <div className="mt-8 flex flex-row gap-4">
        <Button theme="secondary" onClick={handleBack}>
          {t("loadKeyPage.backToStart")}
        </Button>

        <Button
          theme="primary"
          disabled={Boolean(!apiClient || (newFormSubmissions && newFormSubmissions.length === 0))}
          onClick={handleNext}
        >
          {t("loadKeyPage.downloadResponses")}
        </Button>
      </div>
    </div>
  );
};
