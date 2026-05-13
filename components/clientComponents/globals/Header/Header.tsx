"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { SiteLogo } from "@serverComponents/icons";
import { FileNameInput } from "./FileName";
import { ShareButton } from "./ShareButton";
import LanguageToggle from "./LanguageToggle";
import { Button } from "@clientComponents/globals";
import Markdown from "markdown-to-jsx";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { SkipLink } from "../SkipLink";
import { PublishButton } from "./PublishMenu/PublishButton";
type HeaderParams = {
  context?: "admin" | "formBuilder" | "default";
  className?: string;
  shareUsesManageAccess?: boolean;
  alwaysShowLoginLink?: boolean;
};

export const Header = ({
  context = "default",
  className,
  shareUsesManageAccess = false,
  alwaysShowLoginLink = false,
}: HeaderParams) => {
  const isFormBuilder = context === "formBuilder";
  const { status } = useSession();
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "form-builder", "admin-login"]);

  const [isBannerEnabled, setBannerData] = useState(false);
  const [bannerType, setBannerType] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");

  const { getFlag } = useFeatureFlags();
  const isEnabled = getFlag(FeatureFlags.topBanner);
  const isZitadelLoginEnabled = getFlag(FeatureFlags.zitadelLogin);

  useEffect(() => {
    async function fetchBannerData() {
      setBannerData(isEnabled);
      setBannerMessage(t("campaignBanner.message5"));
      setBannerType(t("campaignBanner.type5"));
    }
    fetchBannerData();
  }, [t, isEnabled]);

  const paddingTop = isBannerEnabled ? "py-0" : "py-2";
  const logoHref = status === "authenticated" ? `/${language}/forms` : `/${language}/form-builder`;

  return (
    <>
      <header
        className={cn(
          "mb-5 border-b-1 border-gray-500 bg-white px-0 " + paddingTop + " relative",
          className
        )}
      >
        <SkipLink />
        {isBannerEnabled && (
          <div className="bg-slate-800 p-4 text-white">
            <div className="border-white-default mr-4 inline-block border-2 px-2 py-1">
              {bannerType}
            </div>
            <div className="inline-block">
              <Markdown options={{ forceBlock: true }}>{bannerMessage}</Markdown>
            </div>
          </div>
        )}
        <div className="grid w-full grid-flow-col p-2">
          <div className="flex">
            <Link
              href={logoHref}
              prefetch={false}
              id="logo"
              className="mr-7 flex border-r-1 pr-[14px] text-3xl font-semibold !text-black no-underline focus:bg-white"
            >
              <div className="inline-block h-[45px] w-[46px] p-2">
                <SiteLogo title={t("title")} />
              </div>
            </Link>

            {context === "default" && (
              <div className="mt-3 box-border block h-[40px] px-2 py-1 text-xl font-semibold">
                {t("title", { ns: "common" })}
              </div>
            )}
            {isFormBuilder && <FileNameInput />}
          </div>
          <nav className="justify-self-end" aria-label={t("mainNavAriaLabel", { ns: "common" })}>
            <ul className="mt-2 flex list-none px-0 text-base">
              {(alwaysShowLoginLink || status !== "authenticated") && (
                <li className="tablet:mr-4 mr-2 py-2 text-base">
                  {isZitadelLoginEnabled ? (
                    <form
                      action={async () => {
                        await signIn(
                          "gcForms",
                          { redirectTo: `/${language}/auth/policy` },
                          { max_age: 0 }
                        );
                      }}
                    >
                      <Button type="submit" theme="link">
                        {t("loginMenu.login")}
                      </Button>
                    </form>
                  ) : (
                    <Link href={`/${language}/auth/login`} prefetch={false}>
                      {t("loginMenu.login")}
                    </Link>
                  )}
                </li>
              )}
              {isFormBuilder && (
                <>
                  <li className="tablet:mr-4 mr-2 text-base">
                    <ShareButton manageAccessEnabled={shareUsesManageAccess} />
                  </li>
                  <li className="tablet:mr-4 mr-2 text-base">
                    <PublishButton locale={language} />
                  </li>
                </>
              )}
              <div className="mr-4 border-r-1" />
              {
                <li className="tablet:mr-4 mr-2 py-2">
                  <LanguageToggle />
                </li>
              }
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};
