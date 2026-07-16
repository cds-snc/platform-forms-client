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
          <select
            id="download-version-select"
            className={cn("form-builder-dropdown text-black-default mt-0 mb-0 inline-block", {
              "opacity-60": isLoading,
            })}
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
