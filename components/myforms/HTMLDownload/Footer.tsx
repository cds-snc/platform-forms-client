import React from "react";
import { useTranslation } from "next-i18next";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="lg:mt-10 border-0 bg-gray-100 mt-16 flex-none" data-testid="footer">
      <div className="lg:flex-col lg:items-start lg:gap-4 flex pt-10 pb-5 flex-row items-center justify-between">
        <div>
          <picture>
            <img
              className="lg:h-8 h-10"
              alt={t("fip.text")}
              src="data:image/png;charset=utf-8;base64,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"
            />
          </picture>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
