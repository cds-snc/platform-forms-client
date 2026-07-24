"use client";

import { useEffect } from "react";
import { createClearGcPlatformLoginHintCookie } from "./gcPlatformLoginHintCookie";

export const ClearGcPlatformLoginHint = () => {
  useEffect(() => {
    document.cookie = createClearGcPlatformLoginHintCookie();
  }, []);

  return null;
};
