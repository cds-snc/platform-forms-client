import styles from "./GCHeader.module.css";
import { LanguageToggle } from "./LanguageToggle";
import { type Language } from "@lib/types/form-builder-types";

export const GCHeader = ({ language }: { language: Language }) => {
  return (
    <div className={`gcds-header__brand ${styles["gcds-header__brand"]}`}>
      <div className={`gcds-brand__container ${styles["brand__container"]}`}>
        <section className={`brand__signature ${styles["brand__signature"]}`}>here</section>
        <section className="brand__toggle">
          <LanguageToggle language={language} />
        </section>
      </div>
    </div>
  );
};
