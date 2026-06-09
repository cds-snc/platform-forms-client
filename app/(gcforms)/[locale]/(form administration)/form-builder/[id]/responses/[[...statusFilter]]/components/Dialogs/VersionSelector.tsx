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
      <div className="relative inline-block">
        <select
          id="downloadVersion"
          value={selectedVersion ?? ""}
          onChange={(e) => setSelectedVersion(e.target.value || null)}
          className="gc-select w-auto min-w-55 appearance-none rounded-md border border-2 border-slate-800 py-2 pr-10 pl-4"
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
}
