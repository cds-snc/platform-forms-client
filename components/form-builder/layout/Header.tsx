import React from "react";
import LanguageToggle from "../../globals/LanguageToggle";
import { DownloadFileButton } from "./DownloadFileButton";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import { useNavigationStore } from "../store/useNavigationStore";
import { useAllowPublish } from "../hooks/useAllowPublish";

export const Header = () => {
  const { status } = useSession();
  const { isSaveable } = useAllowPublish();
  const currentTab = useNavigationStore((s) => s.currentTab);
  const setTab = useNavigationStore((s) => s.setTab);

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
    };
  };

  return (
    <div className="border-b-3 border-blue-dark mt-10 mb-10">
      <div className="container--wet">
        <div className="flex" style={{ justifyContent: "space-between" }}>
          <div>
            <button
              onClick={handleClick("start")}
              className="inline-block mr-10 text-h2 mb-6 font-bold font-sans"
            >
              GC Forms
            </button>
            {currentTab !== "start" && isSaveable() && (
              <DownloadFileButton className="!py-1 !px-4" />
            )}
          </div>
          <div className="inline-flex">
            {<LoginMenu isAuthenticated={status === "authenticated"} />}
            {<LanguageToggle />}
          </div>
        </div>
      </div>
    </div>
  );
};
