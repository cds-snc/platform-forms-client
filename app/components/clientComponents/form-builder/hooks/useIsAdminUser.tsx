import { useMemo } from "react";
import { useAccessControl } from "@lib/hooks";

export const useIsAdminUser = () => {
  const { ability } = useAccessControl();

  return useMemo(() => ability?.can("view", "Flag"), [ability]);
};
