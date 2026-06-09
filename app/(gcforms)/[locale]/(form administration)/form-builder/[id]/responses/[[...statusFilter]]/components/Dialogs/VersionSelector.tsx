"use client";
import React from "react";

type Props = {
  dialogVersions: string[];
  selectedVersion: string | null;
  setSelectedVersion: (v: string | null) => void;
  t: (key: string) => string | React.ReactNode;
};

export default function VersionSelector({
  dialogVersions,
  selectedVersion,
  setSelectedVersion,
  t,
}: Props) {
  if (!dialogVersions || dialogVersions.length <= 1) return null;

  return (
    <div className="mb-4">
      <label htmlFor="downloadVersion" className="mb-1 block font-medium">
        {t("downloadResponsesModals.downloadDialog.chooseVersion")}
      </label>
      <select
        id="downloadVersion"
        value={selectedVersion ?? ""}
        onChange={(e) => setSelectedVersion(e.target.value || null)}
        className="gc-select rounded-md border border-slate-300 px-3 py-2"
        data-testid="download-dialog-version-filter"
      >
        <option value="">
          {t("downloadResponsesModals.downloadDialog.chooseVersionPlaceholder")}
        </option>
        {dialogVersions.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
