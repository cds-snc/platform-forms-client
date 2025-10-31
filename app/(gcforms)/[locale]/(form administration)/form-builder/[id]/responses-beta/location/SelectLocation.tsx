"use client";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { DirectoryPicker } from "./DirectoryPicker";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

import { initCsv } from "../lib/csvWriter";

export const SelectLocation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const { t } = useTranslation("response-api");

  const { apiClient, directoryHandle, setDirectoryHandle, setCsvFileHandle } =
    useResponsesContext();

  const setDirectory = useCallback(
    async (handle: FileSystemDirectoryHandle | null) => {
      if (!handle) {
        return;
      }

      setDirectoryHandle(handle);

      const formId = apiClient?.getFormId();
      const formTemplate = await apiClient?.getFormTemplate();

      // Initialize CSV file as needed in the selected directory
      const csvFileHandle = await initCsv({ formId, dirHandle: handle, formTemplate });

      setCsvFileHandle(csvFileHandle ?? null);
    },
    [apiClient, setDirectoryHandle, setCsvFileHandle]
  );

  const handleNext = () => {
    router.push(`/${locale}/form-builder/${id}/responses-beta/format`);
  };

  useEffect(() => {
    if (!apiClient) {
      router.push(`/${locale}/form-builder/${id}/responses-beta`);
    }
  }, [apiClient, locale, id, router]);

  return (
    <div>
      <div className="mb-4">{t("stepOf", { current: 2, total: 3 })}</div>
      <h2>{t("locationPage.title")}</h2>
      <p className="mb-4 mt-2 font-bold">{t("locationPage.subheading")}</p>
      <p className="mb-6 text-sm text-slate-700">{t("locationPage.detail")}</p>

      {!directoryHandle && (
        <div className="mb-8">
          <DirectoryPicker onPick={setDirectory} />
        </div>
      )}

      <div className="flex flex-row gap-4">
        <LinkButton.Secondary href={`/${locale}/form-builder/${id}/responses-beta`}>
          {t("backButton")}
        </LinkButton.Secondary>
        <Button theme="primary" disabled={!directoryHandle} onClick={handleNext}>
          {t("continueButton")}
        </Button>
      </div>
    </div>
  );
};
