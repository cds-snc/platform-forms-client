"use client";

import { FeatureFlags } from "@lib/cache/types";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

export const useFileUploadEnabled = () => {
  const { hasApiKeyId } = useFormBuilderConfig();
  const { getFlag } = useFeatureFlags();

  return hasApiKeyId || getFlag(FeatureFlags.fileUpload);
};
