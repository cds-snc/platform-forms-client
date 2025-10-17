"use client";

import { useTemplateStore } from "@root/lib/store/useTemplateStore";
import { ApiKeyButton } from "../../components/ApiKeyButton";

export const ApiKey = () => {
  const { securityAttribute } = useTemplateStore((s) => ({
    securityAttribute: s.securityAttribute,
  }));

  return <ApiKeyButton showHelp={false} showDelete classification={securityAttribute} />;
};
