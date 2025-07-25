"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { SiteLogo } from "@serverComponents/icons";
import { FileNameInput } from "./FileName";
import { ShareDropdown } from "./ShareDropdown";
import LanguageToggle from "./LanguageToggle";
import { YourAccountDropdown } from "./YourAccountDropdown";
import Markdown from "markdown-to-jsx";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { SkipLink } from "../SkipLink";

type HeaderParams = {
  context?: "admin" | "formBuilder" | "default";
  className?: string;
};

export const Header = ({ context = "default", className }: HeaderParams) => {
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

  useEffect(() => {
    async function fetchBannerData() {
      setBannerData(isEnabled);
      setBannerMessage(t("campaignBanner.message4"));
      setBannerType(t("campaignBanner.type4"));
    }
    fetchBannerData();
  }, [t, isEnabled]);

  const paddingTop = isBannerEnabled ? "py-0" : "py-2";

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
            <div className="mr-4 inline-block border-2 border-white-default px-2 py-1">
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
              href={`/${language}/form-builder`}
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

            {status === "authenticated" && (
              <>
                <div className="mt-3 box-border block h-[40px] px-2 py-1 font-semibold">
                  <Link href={`/${language}/forms`}>
                    {t("adminNav.allForms", { ns: "common" })}
                  </Link>
                  {isFormBuilder && <span className="mx-2 inline-block"> / </span>}
                </div>
              </>
            )}
            {isFormBuilder && <FileNameInput />}
          </div>
          <nav className="justify-self-end" aria-label={t("mainNavAriaLabel", { ns: "common" })}>
            <ul className="mt-2 flex list-none px-0 text-base">
              {status !== "authenticated" && (
                <li className="mr-2 py-2 text-base tablet:mr-4">
                  <Link href={`/${language}/auth/login`} prefetch={false}>
                    {t("loginMenu.login")}
                  </Link>
                </li>
              )}
              {
                <li className="mr-2 py-2 tablet:mr-4">
                  <LanguageToggle />
                </li>
              }
              {isFormBuilder && (
                <li className="mr-2 text-base tablet:mr-4">
                  <ShareDropdown />
                </li>
              )}
              {
                <li className="mr-5 text-base">
                  <YourAccountDropdown isAuthenticated={status === "authenticated"} />
                </li>
              }
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};
