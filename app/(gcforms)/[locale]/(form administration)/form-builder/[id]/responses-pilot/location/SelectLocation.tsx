"use client";
import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { DirectoryPicker } from "./DirectoryPicker";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";
import { toast } from "../../../components/shared/Toast";
import { LocationSelected } from "../components/Toasts";

export const SelectLocation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { t } = useTranslation("response-api");

  const { directoryHandle, setDirectoryHandle, logger } = useResponsesContext();

  const setDirectory = useCallback(
    async (handle: FileSystemDirectoryHandle | null) => {
      if (!handle) {
        return;
      }

      setDirectoryHandle(handle);
      toast.success(<LocationSelected directoryName={handle.name} />, "wide");

      const logsDirectoryHandle = await handle.getDirectoryHandle("logs", { create: true });
      logger.setDirectoryHandle(logsDirectoryHandle);
      logger.info(`Directory selected for response downloads: ${handle.name}`);
    },
    [logger, setDirectoryHandle]
  );

  const handleNext = () => {
    router.push(`/${locale}/form-builder/${id}/responses-pilot/format`);
  };

  useEffect(() => {
    const shouldReset = searchParams?.get("reset") === "true";
    if (!shouldReset) return;
    logger.info("Directory selection reset");
    setDirectoryHandle(null);

    // remove reset param without adding history
    const cleanUrl = `/${locale}/form-builder/${id}/responses-pilot/location`;
    router.replace(cleanUrl);
  }, [id, locale, logger, router, searchParams, setDirectoryHandle]);

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
          href={`/${locale}/form-builder/${id}/responses-pilot/load-key?reset=true`}
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
