"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { getDownloadableFormVersions } from "../actions";
import { toast } from "@formBuilder/components/shared/Toast";
import { cn } from "@lib/utils";
import {
  DOWNLOADABLE_TEMPLATE_VERSION_LABEL,
  DownloadableTemplateVersion,
} from "@lib/templates/versioning/downloadableTemplateVersion";

const extractDownloadableVersions = (value: unknown): DownloadableTemplateVersion[] | null => {
  if (!value || typeof value !== "object" || !("versions" in value)) {
    return null;
  }

  const candidate = value as { versions?: unknown };

  return Array.isArray(candidate.versions)
    ? (candidate.versions as DownloadableTemplateVersion[])
    : null;
};

const fetchDownloadableFormVersions = async (formId: string): Promise<unknown> => {
  return getDownloadableFormVersions(formId);
};

export const DownloadForm = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { id, name } = useTemplateStore((s) => ({
    id: s.id,
    name: s.name,
  }));
  const [versions, setVersions] = useState<DownloadableTemplateVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    const loadVersions = async () => {
      setIsLoading(true);
      const nextVersions = extractDownloadableVersions(await fetchDownloadableFormVersions(id));

      if (!active) {
        return;
      }

      if (!nextVersions) {
        toast.error(t("errors.formDownloadFailed"));
        setVersions([]);
        setSelectedVersion("");
        setIsLoading(false);
        return;
      }

      setVersions(nextVersions);
      setSelectedVersion(nextVersions[0] ? String(nextVersions[0].versionNumber) : "");
      setIsLoading(false);
    };

    loadVersions();

    return () => {
      active = false;
    };
  }, [id, t]);

  const selectedVersionConfig = useMemo(() => {
    return versions.find((version) => String(version.versionNumber) === selectedVersion);
  }, [selectedVersion, versions]);

  const downloadSelectedVersion = () => {
    if (!selectedVersionConfig) {
      return;
    }

    const fileName =
      name ||
      (i18n.language === "fr"
        ? selectedVersionConfig.formConfig.titleFr
        : selectedVersionConfig.formConfig.titleEn);

    const data = JSON.stringify(selectedVersionConfig.formConfig, null, 2);
    const tempUrl = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");

    link.href = tempUrl;
    link.setAttribute(
      "download",
      slugify(`${fileName}-v${selectedVersionConfig.versionNumber}-${getDate()}`) + ".json"
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(tempUrl);
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
                "gc-select w-auto min-w-55 appearance-none rounded-md border-2 border-slate-800 py-2 pr-10 pl-4",
                {
                  "opacity-60": isLoading,
                }
              )}
              value={selectedVersion}
              onChange={(event) => setSelectedVersion(event.target.value)}
              disabled={isLoading || versions.length === 0}
            >
              {versions.map((version) => (
                <option key={version.versionNumber} value={version.versionNumber}>
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
            disabled={isLoading || !selectedVersionConfig}
            dataTestId="download-file-button"
          >
            {t("formDownload.downloadBtnText")}
          </Button>
        </div>
      </div>
    </>
  );
};
