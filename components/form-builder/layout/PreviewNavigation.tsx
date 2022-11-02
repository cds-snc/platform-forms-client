import React from "react";
import { useTranslation } from "next-i18next";

export const PreviewNavigation = ({
  currentTab,
  handleClick,
}: {
  currentTab: string;
  handleClick: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <nav className="mb-8" aria-label={t("navLabelPreview")}>
      <button
        className={`mr-5 ${
          currentTab === "preview" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick("preview")}
      >
        {t("preview")}
      </button>
      |
      <button
        className={`ml-5 ${
          currentTab === "test-data-delivery" ? "font-bold" : ""
        } outline-blue-focus outline-offset-2`}
        onClick={handleClick("test-data-delivery")}
      >
        {t("testDataDelivery")}
      </button>
    </nav>
  );
};
