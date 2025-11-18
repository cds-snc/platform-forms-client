"use client";

import Link from "next/link";

import { cn } from "@lib/utils/";

import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { useTranslation } from "@i18n/client";

import { enableResponsesPilotMode } from "../../actions";

export const ResponseBetaLink = ({ formId, className }: { formId: string; className?: string }) => {
  const { t, i18n } = useTranslation("form-builder-responses");
  const { getFlag } = useFeatureFlags();
  const responsesPilotEnabled = getFlag(FeatureFlags.responsesPilot);

  const handleResponsesPilotClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await enableResponsesPilotMode();
  };

  return (
    responsesPilotEnabled && (
      <Link
        scroll={false}
        data-testid="responses-pilot-link"
        href={`/${i18n.language}/form-builder/${formId}/responses-pilot`}
        onClick={handleResponsesPilotClick}
        className={cn("text-black visited:text-black", className)}
      >
        {t("responsesPilot.responsesPilotLink")}
      </Link>
    )
  );
};
