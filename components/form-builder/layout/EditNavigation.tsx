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
    <nav className="mb-8 flex divide-x-2 divide-gray-600" aria-label={t("navLabelEditor")}>
      <button
        className={`pr-4 ${
          currentTab === "create" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick("create")}
      >
        {t("questions")}
      </button>
      <button
        className={`pl-4 ${
          currentTab === "translate" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick("translate")}
      >
        {t("translate")}
      </button>
    </nav>
  );
};
