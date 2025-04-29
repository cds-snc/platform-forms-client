import { LanguageToggle } from "./LanguageToggle";
import { Fip } from "./Fip";
import { type Language } from "@lib/types/form-builder-types";

export const GCHeader = ({ language }: { language: Language }) => {
  return (
    <div className="gcds-header__container">
      <header className="gcds-header">
        <div className="gcds-header__brand">
          <div className="brand__container">
            <Fip language={language} />
            <LanguageToggle language={language} />
          </div>
        </div>
      </header>
    </div>
  );
};
