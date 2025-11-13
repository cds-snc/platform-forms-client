"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { useTranslation } from "@i18n/client";

import { enableResponsesBetaMode } from "../../actions";

export const ResponseBetaLink = ({ formId }: { formId: string }) => {
  const { t, i18n } = useTranslation("form-builder-responses");
  const { getFlag } = useFeatureFlags();
  const responsesBetaEnabled = getFlag(FeatureFlags.responsesBeta);
  const router = useRouter();

  const handleResponsesBetaClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await enableResponsesBetaMode();
    router.push(`/${i18n.language}/form-builder/${formId}/responses-beta`);
  };

  return (
    responsesBetaEnabled && (
      <Link
        data-testid="responses-beta-link"
        href={`/${i18n.language}/form-builder/${formId}/responses-beta`}
        onClick={handleResponsesBetaClick}
        className="ml-12 text-black visited:text-black"
      >
        {t("responsesBeta.responsesBetaLink")}
      </Link>
    )
  );
};
