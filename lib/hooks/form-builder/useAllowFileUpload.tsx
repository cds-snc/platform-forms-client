import { useMemo } from "react";
import { useFeatureFlags } from "../useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";

export const useAllowFileUpload = () => {
  const { getFlag } = useFeatureFlags();

  return useMemo(() => {
    return getFlag(FeatureFlags.fileUpload);
  }, [getFlag]);
};
