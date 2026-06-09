"use client";
import React from "react";

type CheckedMeta = { id?: string; name?: string; versionId?: string | null }[];

export default function useTemplateVersioning(
  checkedItems: Map<string, boolean>,
  checkedMeta?: CheckedMeta
) {
  const ids = React.useMemo(() => Array.from(checkedItems.keys()), [checkedItems]);

  const metaMap = React.useMemo(() => {
    const map = new Map<string, { versionId?: string | null }>();
    if (checkedMeta && checkedMeta.length > 0) {
      checkedMeta.forEach((m) => {
        if (m && m.name) map.set(m.name, { versionId: m.versionId });
      });
    }
    return map;
  }, [checkedMeta]);

  const filteredIdsWithVersion = React.useMemo(
    () => ids.filter((id) => Boolean(metaMap.get(id)?.versionId)),
    [ids, metaMap]
  );

  const dialogVersions = React.useMemo(
    () =>
      Array.from(new Set(filteredIdsWithVersion.map((id) => metaMap.get(id)!.versionId as string))),
    [filteredIdsWithVersion, metaMap]
  );

  const getFilteredIds = React.useCallback(
    (selectedVersionForDialog?: string | null) =>
      selectedVersionForDialog
        ? filteredIdsWithVersion.filter(
            (id) => metaMap.get(id)!.versionId === selectedVersionForDialog
          )
        : filteredIdsWithVersion,
    [filteredIdsWithVersion, metaMap]
  );

  return { ids, metaMap, filteredIdsWithVersion, dialogVersions, getFilteredIds };
}
