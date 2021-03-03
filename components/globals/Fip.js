import React from "react";
import { useTranslation } from "next-i18next";
import LanguageToggle from "./LanguageToggle";

const Fip = () => {
  const { t, i18n } = useTranslation("common");
  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a href={t("fip.link")} aria-label={t("fip.text")}>
          <img
            src={"/img/sig-blk-" + i18n.language + ".svg"}
            alt={t("fip.text")}
          />
        </a>
      </div>
      <LanguageToggle />
    </div>
  );
};

export default Fip;
