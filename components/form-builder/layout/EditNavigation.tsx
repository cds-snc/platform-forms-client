import React from "react";
import { useTranslation } from "next-i18next";

export const EditNavigation = ({
  currentTab,
  handleClick,
}: {
  currentTab: string;
  handleClick: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <div className="mb-8">
        <button
          className={`mr-5 ${currentTab === "create" ? "font-bold" : ""}`}
          onClick={handleClick("create")}
        >
          {t("questions")}
        </button>
        |
        <button
          className={`ml-5 mr-5 ${currentTab === "translate" ? "font-bold" : ""}`}
          onClick={handleClick("translate")}
        >
          {t("translate")}
        </button>
        |
        <button
          className={`ml-5 ${currentTab === "settings" ? "font-bold" : ""}`}
          onClick={handleClick("settings")}
        >
          {t("settings")}
        </button>
      </div>
    </>
  );
};
