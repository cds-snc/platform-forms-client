import { LanguageToggle } from "./LanguageToggle";
import { Fip } from "./Fip";
import { type Language } from "@lib/types/form-builder-types";

export const GCHeader = ({ language }: { language: Language }) => {
  return (
    <div className="gcds-header__container">
      <header className="gcds-header">
        <div className="gcds-header__brand">
          <div className="brand__container">
            <div className="brand__toggle">
              <LanguageToggle language={language} />
            </div>
            <Fip language={language} />
          </div>
        </div>
      </header>
    </div>
  );
};
