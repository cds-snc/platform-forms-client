import React from "react";
import { useTranslation } from "next-i18next";

export const EditNavigation = ({
  currentTab,
  handleClick,
}: {
  currentTab?: string;
  handleClick?: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <nav className="mb-8" aria-label={t("navLabelEditor")}>
      <button
        className={`mr-5 ${
          currentTab === "create" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick && handleClick("create")}
      >
        {t("questions")}
      </button>
      |
      <button
        className={`ml-5 mr-5 ${
          currentTab === "translate" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick && handleClick("translate")}
      >
        {t("translate")}
      </button>
    </nav>
  );
};
