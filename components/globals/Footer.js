import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const Footer = ({ t }) => (
  <footer className="gc-footer" data-testid="footer">
    <div className="gc-footer-container">
      <div>
        <ul>
          <li>
            <a href={t("footer.privacy.link")}>{t("footer.privacy.desc")}</a>
          </li>
          <li>
            <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>
          </li>
        </ul>
      </div>
      <div>
        <img alt={t("fip.text")} src="/img/wmms-blk.svg" />
      </div>
    </div>
  </footer>
);

Footer.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default withTranslation("common")(Footer);
