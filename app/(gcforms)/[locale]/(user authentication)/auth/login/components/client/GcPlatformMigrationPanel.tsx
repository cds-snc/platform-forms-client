"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { GC_PLATFORM_LOGIN_HINT_COOKIE, GC_PLATFORM_LOGIN_HINT_VALUE } from "@root/constants";
import { parseCookie } from "cookie";
import { usePathname } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Trans } from "react-i18next";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";

import { PlatformSignInLogo } from "./PlatformSignInLogo";
import { GcPlatformSignInButton } from "./GcPlatformSignInButton";

type GcPlatformMigrationPanelProps = {
  locale: string;
};

export const GcPlatformMigrationPanel = ({ locale }: GcPlatformMigrationPanelProps) => {
  const pathname = usePathname();
  const { getFlag } = useFeatureFlags();
  const [hasMounted, setHasMounted] = useState(false);
  const [hasGcPlatformLoginHint, setHasGcPlatformLoginHint] = useState(false);
  const {
    t,
    i18n: { language },
  } = useTranslation("login");

  const isLoginPage = pathname === `/${locale}/auth/login`;
  const isZitadelLoginEnabled = getFlag(FeatureFlags.zitadelLogin);
  const beforeYouStartUrl = `${process.env.NEXT_PUBLIC_ZITADEL_URL ?? ""}/before-you-start`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate prevents a server/client render mismatch
    setHasMounted(true);

    const parsedCookies = parseCookie(document.cookie);
    setHasGcPlatformLoginHint(
      parsedCookies[GC_PLATFORM_LOGIN_HINT_COOKIE] === GC_PLATFORM_LOGIN_HINT_VALUE
    );
  }, []);

  if (!hasMounted || !isLoginPage || !isZitadelLoginEnabled || hasGcPlatformLoginHint) {
    return null;
  }

  return (
    <aside data-testid="gc-platform-migration-panel">
      <div className="mb-6 w-full max-w-96 rounded-xl border border-[#BFC5CB] bg-white p-6">
        <div className="mb-6">
          <PlatformSignInLogo />
        </div>

        <h2 className="mb-4 text-2xl leading-tight font-semibold">{t("migrationPanel.title")}</h2>
        <p className="mb-4 text-base">
          <Trans
            ns="login"
            i18nKey="migrationPanel.bodyLead"
            defaults="<strong></strong>"
            components={{ strong: <strong /> }}
          />
        </p>
        <p className="mb-6 text-base">
          <Trans
            ns="login"
            i18nKey="migrationPanel.bodyDeadline"
            defaults="<strong></strong>"
            components={{ strong: <strong /> }}
          />
        </p>
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
