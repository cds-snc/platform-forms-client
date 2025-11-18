"use client";

import Link from "next/link";

import { cn } from "@lib/utils/";

import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { useTranslation } from "@i18n/client";

import { enableResponsesBetaMode } from "../../actions";

export const ResponseBetaLink = ({ formId, className }: { formId: string; className?: string }) => {
  const { t, i18n } = useTranslation("form-builder-responses");
  const { getFlag } = useFeatureFlags();
  const responsesBetaEnabled = getFlag(FeatureFlags.responsesBeta);

  const handleResponsesBetaClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await enableResponsesBetaMode();
  };

  return (
    responsesBetaEnabled && (
      <Link
        scroll={false}
        data-testid="responses-beta-link"
        href={`/${i18n.language}/form-builder/${formId}/responses-beta`}
        onClick={handleResponsesBetaClick}
        className={cn("text-black visited:text-black", className)}
      >
        {t("responsesBeta.responsesBetaLink")}
      </Link>
    )
  );
};
