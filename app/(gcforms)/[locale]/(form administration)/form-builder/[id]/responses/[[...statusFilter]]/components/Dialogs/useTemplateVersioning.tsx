"use client";
import React from "react";

type CheckedMeta = { id?: string; name?: string; version?: string | null }[];

export const useTemplateVersioning = (
  checkedItems: Map<string, boolean>,
  checkedMeta?: CheckedMeta
) => {
  const ids = React.useMemo(() => Array.from(checkedItems.keys()), [checkedItems]);

  const metaMap = React.useMemo(() => {
    const map = new Map<string, { version?: string | null }>();
    if (checkedMeta && checkedMeta.length > 0) {
      checkedMeta.forEach((m) => {
        if (m && m.name) map.set(m.name, { version: m.version });
      });
    }
    return map;
  }, [checkedMeta]);

  const filteredIdsWithVersion = React.useMemo(
    () => ids.filter((id) => Boolean(metaMap.get(id)?.version)),
    [ids, metaMap]
  );

  const dialogVersions = React.useMemo(
    () =>
      Array.from(new Set(filteredIdsWithVersion.map((id) => metaMap.get(id)!.version as string))),
    [filteredIdsWithVersion, metaMap]
  );

  const getFilteredIds = React.useCallback(
    (selectedVersionForDialog?: string | null) => {
      const versions = selectedVersionForDialog
        ? filteredIdsWithVersion.filter((id) => {
            const version = String(metaMap.get(id)?.version);
            return version === selectedVersionForDialog;
          })
        : filteredIdsWithVersion;

      return versions;
    },
    [filteredIdsWithVersion, metaMap]
  );

  return { ids, metaMap, filteredIdsWithVersion, dialogVersions, getFilteredIds };
};
