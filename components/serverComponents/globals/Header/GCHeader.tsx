import { LanguageToggle } from "./LanguageToggle";
import { BrandContainer } from "./BrandContainer";
import { Fip } from "./Fip";
import { type Language } from "@lib/types/form-builder-types";

export const GCHeader = ({ language }: { language: Language }) => {
  return (
    <div className="gcds-header__container">
      <header className="gcds-header">
        <BrandContainer>
          <Fip language={language} link={""} />
          <LanguageToggle language={language} />
        </BrandContainer>
      </header>
    </div>
  );
};
