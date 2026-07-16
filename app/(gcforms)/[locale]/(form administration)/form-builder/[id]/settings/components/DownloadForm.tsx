"use client";
import { useMemo, useState } from "react";
import { FormProperties } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { getDownloadableFormVersionConfig } from "../actions";
import { toast } from "@formBuilder/components/shared/Toast";
import { cn } from "@lib/utils";
import {
  DOWNLOADABLE_TEMPLATE_VERSION_LABEL,
  DownloadableTemplateVersion,
} from "@lib/templates/versioning/downloadableTemplateVersion";

type Props = {
  versions: DownloadableTemplateVersion[];
};

export const DownloadForm = ({ versions }: Props) => {
  const { t, i18n } = useTranslation("form-builder");
  const { id, name } = useTemplateStore((s) => ({
    id: s.id,
    name: s.name,
  }));
  const [selectedVersion, setSelectedVersion] = useState<string>(
    versions[0] ? (versions[0].id ?? String(versions[0].versionNumber)) : ""
  );

  const selectedVersionMeta = useMemo(() => {
    return versions.find((version) =>
      version.id
        ? version.id === selectedVersion
        : String(version.versionNumber) === selectedVersion
    );
  }, [selectedVersion, versions]);

  const downloadSelectedVersion = async () => {
    if (!selectedVersionMeta) return;

    try {
      const res = await getDownloadableFormVersionConfig(id, selectedVersionMeta.id);
      const result = res as { error?: unknown; formConfig?: unknown };

      if (result.error || !result.formConfig) {
        toast.error(t("errors.formDownloadFailed"));
        return;
      }

      const formConfig = result.formConfig as FormProperties;

      const fileName = name || (i18n.language === "fr" ? formConfig.titleFr : formConfig.titleEn);

      const data = JSON.stringify(formConfig, null, 2);
      const tempUrl = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");

      link.href = tempUrl;
      link.setAttribute(
        "download",
        slugify(`${fileName}-v${selectedVersionMeta.versionNumber}-${getDate()}`) + ".json"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(tempUrl);
    } catch (err) {
      toast.error(t("errors.formDownloadFailed"));
    }
  };

  const buildVersionLabel = (version: DownloadableTemplateVersion) => {
    if (version.label === DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentDraft) {
      return t("formDownload.versionSelector.currentDraft", { version: version.versionNumber });
    }

    if (version.label === DOWNLOADABLE_TEMPLATE_VERSION_LABEL.currentPublished) {
      return t("formDownload.versionSelector.currentPublished", {
        version: version.versionNumber,
      });
    }

    return t("formDownload.versionSelector.previousVersion", { version: version.versionNumber });
  };

  return (
    <>
      <div id="download-form" className="mb-10">
        <h2>{t("formDownload.title")}</h2>
        <p className="mb-4" id="download-hint">
          {t("formDownload.description")}
        </p>
        <label htmlFor="download-version-select" className="mb-1 block font-bold">
          {t("formDownload.versionSelector.label")}
        </label>
        <div className="flex items-end gap-4">
          <div className="relative inline-block">
            <select
              id="download-version-select"
              className={cn(
                "gc-select w-auto min-w-55 appearance-none rounded-md border-2 border-slate-800 py-2 pr-10 pl-4"
              )}
              value={selectedVersion}
              onChange={(event) => setSelectedVersion(event.target.value)}
              disabled={versions.length === 0}
            >
              {versions.map((version) => (
                <option
                  key={version.id ?? version.versionNumber}
                  value={version.id ?? String(version.versionNumber)}
                >
                  {buildVersionLabel(version)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <Button
            theme="primary"
            onClick={downloadSelectedVersion}
            disabled={!selectedVersionMeta}
            dataTestId="download-file-button"
          >
            {t("formDownload.downloadBtnText")}
          </Button>
        </div>
      </div>
    </>
  );
};
