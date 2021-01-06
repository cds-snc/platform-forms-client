import PropTypes from "prop-types";
import { withTranslation } from "../../i18n";

const Footer = ({ t }) => (
  <footer className="border-0 bg-gray-100 mt-20">
    <div className="page--container flex flex-row justify-between md:items-baseline pt-4 md:pt-10 pb-6 md:pb-10">
      <div className="footer-links md:w-4/5">
        <ul className="p-0 text-base list-inside">
          <li className="md:inline-block pr-4">
            <a
              href={t("footer.privacy.link")}
              className="no-underline hover:underline"
            >
              {t("footer.privacy.desc")}
            </a>
          </li>
          <li className="md:inline-block">
            <a
              href={t("footer.terms.link")}
              className="no-underline hover:underline"
            >
              {t("footer.terms.desc")}
            </a>
          </li>
        </ul>
      </div>
      <div className="md:w-1/5 md:relative">
        <img
          src="/img/wmms-blk.svg"
          className="h-12 pt-2 md:absolute md:bottom-0 md:right-0"
        />
      </div>
    </div>
  </footer>
);

Footer.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(Footer);
