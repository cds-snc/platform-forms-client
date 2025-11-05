"use client";
import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { DirectoryPicker } from "./DirectoryPicker";

import { initCsv } from "../lib/csvWriter";
import { toast } from "../../../components/shared/Toast";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";

const CsvDetected = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("locationPage.csvDetected.title")}</h3>
      <p className="mb-2 text-black">{t("locationPage.csvDetected.message")}</p>
    </div>
  );
};

const TemplateFailed = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("locationPage.getTemplateFailed.title")}
      </h3>
      <p className="mb-2 text-black">{t("locationPage.getTemplateFailed.message")}</p>
    </div>
  );
};

export const SelectLocation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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

      try {
        const formTemplate = await apiClient?.getFormTemplate();

        // Initialize CSV file as needed in the selected directory
        const result = await initCsv({ formId, dirHandle: handle, formTemplate });

        const csvFileHandle = result && result.handle;

        setCsvFileHandle(csvFileHandle ?? null);

        const csvExists = result && !result.created;

        if (csvExists) {
          toast.success(<CsvDetected />, "wide");
        }
      } catch (e) {
        toast.error(<TemplateFailed />, "wide");
        return;
      }
    },
    [apiClient, setDirectoryHandle, setCsvFileHandle]
  );

  const handleNext = () => {
    router.push(`/${locale}/form-builder/${id}/responses-beta/format`);
  };

  useEffect(() => {
    const shouldReset = searchParams?.get("reset") === "true";
    if (!shouldReset) return;

    setDirectoryHandle(null);
    setCsvFileHandle(null);

    // remove reset param without adding history
    const cleanUrl = `/${locale}/form-builder/${id}/responses-beta/location`;
    router.replace(cleanUrl);
  }, [id, locale, router, searchParams, setCsvFileHandle, setDirectoryHandle]);

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
        <LinkButton.Secondary
          href={`/${locale}/form-builder/${id}/responses-beta/load-key?reset=true`}
        >
          {t("backButton")}
        </LinkButton.Secondary>
        <Button theme="primary" disabled={!directoryHandle} onClick={handleNext}>
          {t("continueButton")}
        </Button>
      </div>
    </div>
  );
};
