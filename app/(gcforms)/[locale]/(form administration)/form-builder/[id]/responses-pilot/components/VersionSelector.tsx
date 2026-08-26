"use client";
import { useEffect } from "react";

import { Tooltip } from "@formBuilder/components/shared/Tooltip";

type Props = {
  responseVersions: string[];
  selectedVersion: string | null;
  setSelectedVersion: (v: string | null) => void;
  t: (key: string) => string | React.ReactNode;
  isTemplateVersioningEnabled?: boolean;
};

export const VersionSelector = ({
  responseVersions,
  selectedVersion,
  setSelectedVersion,
  t,
  isTemplateVersioningEnabled,
}: Props) => {
  // ensure a version is still passed when the feature is off
  useEffect(() => {
    if (!isTemplateVersioningEnabled) {
      const v = responseVersions.length >= 1 ? responseVersions[0] : null;
      if (!selectedVersion && v) setSelectedVersion(v);
    }
  }, [isTemplateVersioningEnabled, responseVersions, selectedVersion, setSelectedVersion]);

  if (!responseVersions || responseVersions.length === 0) return null;

  const isDisabled = responseVersions.length === 1;
  const base =
    "gc-select w-auto min-w-55 appearance-none rounded-md border-2 border-slate-800 py-2 pr-10 pl-4";
  const disabledStyles = "bg-slate-100 text-slate-500 cursor-not-allowed";

  return (
    <div className={`mb-4 ${!isTemplateVersioningEnabled ? "hidden" : ""}`}>
      <div>
        <label htmlFor="downloadVersion" className="mb-1 inline-block font-medium">
          {t("loadKeyPage.versionSelector.label")}
        </label>

        <Tooltip.Info
          side="top"
          triggerClassName="align-middle ml-1"
          tooltipClassName="font-normal"
        >
          <strong>{t(`tooltips.version.title`)}</strong>
          <p>{t(`tooltips.version.body`)}</p>
        </Tooltip.Info>
      </div>

      <div className="relative inline-block">
        <select
          id="downloadVersion"
          value={selectedVersion ?? (responseVersions.length === 1 ? responseVersions[0] : "")}
          onChange={(e) => setSelectedVersion(e.target.value || null)}
          className={`${base} ${isDisabled ? disabledStyles : "bg-white"}`}
          data-testid="download-dialog-version-filter"
          disabled={isDisabled}
        >
          <option value="">{t("loadKeyPage.versionSelector.placeholder")}</option>
          {responseVersions.map((v) => (
            <option key={v} value={v}>
              {v}
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
    </div>
  );
};
