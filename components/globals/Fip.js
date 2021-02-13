import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";
import LanguageToggle from "./LanguageToggle";

const Fip = ({ t, i18n }) => (
  <div data-testid="fip" className="gc-fip xs:flex-col-reverse xs:items-start">
    <div className="canada-flag xs:w-flag-5s w-flag-desktop mt-10">
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

Fip.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation("common")(Fip);
