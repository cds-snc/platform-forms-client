import React from "react";

export const VersionBadge = ({
  versionNumber,
  versionText = "Version",
}: {
  versionNumber?: number | null;
  versionText?: React.ReactNode;
}) => {
  if (!versionNumber) return null;

  return (
    <div className="inline-flex self-start rounded-sm border border-slate-400 bg-slate-100 px-3 py-1 text-sm font-semibold whitespace-nowrap text-slate-700">
      {versionText} {versionNumber}
    </div>
  );
};
