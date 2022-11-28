import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useNavigationStore } from "@components/form-builder/store";

export const PreviewNavigation = ({ currentTab }: { currentTab?: string }) => {
  const { t } = useTranslation("form-builder");

  const { setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const router = useRouter();
  const { status } = useSession();
  return (
    <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelPreview")}>
      <button
        className={`pr-4 ${
          currentTab === "preview" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={() => {
          setTab("preview");
          router.push({ pathname: `/form-builder/preview` });
        }}
      >
        {t("preview")}
      </button>
      {status === "authenticated" && (
        <>
          <button
            className={`pl-4 pr-4 ${
              currentTab === "test-data-delivery" ? "font-bold" : ""
            } outline-blue-focus outline-offset-2`}
            onClick={() => {
              setTab("test-data-delivery");
              router.push({ pathname: `/form-builder/test-data-delivery` });
            }}
          >
            {t("testDataDelivery")}
          </button>
        </>
      )}
      <button
        className={`pl-4 ${
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
