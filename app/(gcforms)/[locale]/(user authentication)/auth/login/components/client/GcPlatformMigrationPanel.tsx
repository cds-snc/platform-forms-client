"use client";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { GC_PLATFORM_LOGIN_HINT_COOKIE, GC_PLATFORM_LOGIN_HINT_VALUE } from "@root/constants";
import { parseCookie } from "cookie";
import { usePathname } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { GcPlatformSignInButton } from "./GcPlatformSignInButton";

type GcPlatformMigrationPanelProps = {
  locale: string;
};

export const GcPlatformMigrationPanel = ({ locale }: GcPlatformMigrationPanelProps) => {
  const pathname = usePathname();
  const { getFlag } = useFeatureFlags();
  const {
    t,
    i18n: { language },
  } = useTranslation("login");

  const isLoginPage = pathname === `/${locale}/auth/login`;
  const isZitadelLoginEnabled = getFlag(FeatureFlags.zitadelLogin);
  const beforeYouStartUrl = `${process.env.NEXT_PUBLIC_ZITADEL_URL ?? ""}/before-you-start`;
  const parsedCookies = typeof document !== "undefined" ? parseCookie(document.cookie) : null;
  const hasGcPlatformLoginHint =
    parsedCookies?.[GC_PLATFORM_LOGIN_HINT_COOKIE] === GC_PLATFORM_LOGIN_HINT_VALUE;

  if (!isLoginPage || !isZitadelLoginEnabled || hasGcPlatformLoginHint) {
    return null;
  }

  return (
    <aside data-testid="gc-platform-migration-panel">
      <div className="mb-6 w-full max-w-96 rounded-xl border border-[#BFC5CB] bg-white p-6">
        <h2 className="mb-4 text-2xl leading-tight font-semibold">{t("migrationPanel.title")}</h2>
        <p className="mb-4">{t("migrationPanel.bodyLead")}</p>
        <p className="mb-6">{t("migrationPanel.bodyDeadline")}</p>
        <div className="mb-4">
          <LinkButton.Primary href={beforeYouStartUrl} target="_blank">
            {t("migrationPanel.createAccount")}
          </LinkButton.Primary>
        </div>
      </div>
      <GcPlatformSignInButton locale={language} label={t("migrationPanel.signInWithGcPlatform")} />
    </aside>
  );
};
