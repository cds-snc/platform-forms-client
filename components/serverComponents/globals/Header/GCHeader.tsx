import { LanguageToggle } from "./LanguageToggle";
import { type Language } from "@lib/types/form-builder-types";

export const GCHeader = ({ language }: { language: Language }) => {
  return (
    <header className="gcds-header">
      <div className="gcds-header__brand">
        <div className="brand__container">
          <section>Canada</section>
          <section>
            <LanguageToggle language={language} />
          </section>
        </div>
      </div>
    </header>
  );
};
