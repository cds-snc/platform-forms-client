import React from "react";
import { useTranslation } from "next-i18next";

const PhaseBanner = () => {
  const { t } = useTranslation("common");
  return (
    <div data-testid="PhaseBanner" className="gc-phase-banner">
      <div className="banner-container">
        <div>
          <span className="phase-badge">ALPHA</span>
        </div>
        <div>
          <span className="phase-text">{t("phase.desc")}</span>
        </div>
      </div>
    </div>
  );
};

export default PhaseBanner;
