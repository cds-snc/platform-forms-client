"use client";

import { useEffect } from "react";
import { ga } from "@lib/client/clientHelpers";

export const useFeatureDetect = ({ formId }: { formId: string }) => {
  useEffect(() => {
    const features = {
      formId,
      hasCrypto: "crypto" in window,
      hasFilePicker: "showOpenFilePicker" in window,
    };

    // Send the feature detection results to Google Analytics
    ga("feature_detect", features);
  }, [formId]);
};
