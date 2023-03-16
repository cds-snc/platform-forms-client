import { useEffect, useMemo } from "react";
import { useAccessControl } from "@lib/hooks";

export const useIsAdminUser = () => {
  const { ability, refreshAbility } = useAccessControl();
  useEffect(() => {
    refreshAbility && refreshAbility();
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => ability?.can("view", "Flag"), [ability]);
};
