"use client";
import { useMemo } from "react";
import { useAccessControl } from "../useAccessControl";

export const useIsAdminUser = () => {
  const { ability } = useAccessControl();
  return useMemo(() => ability?.can("view", "Flag"), [ability]);
};
