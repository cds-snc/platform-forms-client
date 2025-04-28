import styles from "./GCHeader.module.css";
import { LanguageToggle } from "./LanguageToggle";
import { type Language } from "@lib/types/form-builder-types";

export const GCHeader = ({ language }: { language: Language }) => {
  return (
    <div className={`gcds-header__brand ${styles["gcds-header__brand"]}`}>
      <section className={`brand__signature ${styles["brand__signature"]}`}>here</section>
      <section className={`brand__toggle ${styles["brand__toggle"]}`}>
        <LanguageToggle language={language} />
      </section>
    </div>
  );
};
