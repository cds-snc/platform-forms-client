import React from "react";
import LanguageToggle from "../../globals/LanguageToggle";
import { DownloadFileButton } from "./DownloadFileButton";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import { useNavigationStore } from "../store/useNavigationStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";

export const Header = () => {
  const { t } = useTranslation("common");
  const { status } = useSession();
  const { isSaveable } = useAllowPublish();
  const { ability } = useAccessControl();
  const currentTab = useNavigationStore((s) => s.currentTab);
  const setTab = useNavigationStore((s) => s.setTab);

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
    };
  };

  return (
    <header className="border-b-3 border-blue-dark my-10">
      <div className="flex justify-between">
        <div>
          <button
            type="button"
            onClick={handleClick("start")}
            className="inline-block mr-10 text-h2 mb-6 font-bold font-sans"
          >
            {t("title")}
          </button>
          {currentTab !== "start" && isSaveable() && <DownloadFileButton className="!py-1 !px-4" />}
        </div>
        <div className="inline-flex gap-4">
          <div className="md:text-small_base text-base font-normal not-italic">
            {ability?.can("view", "FormRecord") && (
              <Link href="/myforms">{t("adminNav.myforms")}</Link>
            )}
          </div>
          {<LoginMenu isAuthenticated={status === "authenticated"} />}
          {<LanguageToggle />}
        </div>
      </div>
    </header>
  );
};
