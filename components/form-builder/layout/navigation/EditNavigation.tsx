import React from "react";
import { useTranslation } from "next-i18next";
import { useNavigationStore } from "../../store/useNavigationStore";
import { useRouter } from "next/router";

export const EditNavigation = ({ currentTab }: { currentTab?: string }) => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();

  const { setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  return (
    <nav className="mb-8" aria-label={t("navLabelEditor")}>
      <button
        className={`mr-5 ${
          currentTab === "create" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={() => {
          setTab("create");
          router.push({ pathname: `/form-builder/edit` });
        }}
      >
        {t("questions")}
      </button>
      |
      <button
        className={`ml-5 mr-5 ${
          currentTab === "translate" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={() => {
          setTab("translate");
          router.push({ pathname: `/form-builder/translate` });
        }}
      >
        {t("translate")}
      </button>
    </nav>
  );
};
