import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useNavigationStore } from "@components/form-builder/store";

export const PreviewNavigation = ({
  currentTab,
  handleClick,
}: {
  currentTab?: string;
  handleClick?: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const router = useRouter();
  const { status } = useSession();
  return (
    <nav className="mb-8" aria-label={t("navLabelPreview")}>
      <button
        className={`mr-5 ${
          currentTab === "preview" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick && handleClick("preview")}
      >
        {t("preview")}
      </button>
      {status === "authenticated" && (
        <>
          |
          <button
            className={`ml-5 mr-5 ${
              currentTab === "test-data-delivery" ? "font-bold" : ""
            } outline-blue-focus outline-offset-2`}
            onClick={handleClick && handleClick("test-data-delivery")}
          >
            {t("testDataDelivery")}
          </button>
        </>
      )}
      |{" "}
      <button
        className={`ml-5 ${
          currentTab === "settings" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={() => {
          setTab("settings");
          router.push({ pathname: `/form-builder/settings` });
        }}
      >
        {t("settings")}
      </button>
    </nav>
  );
};
