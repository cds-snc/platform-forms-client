import { LanguageToggle } from "./LanguageToggle";
import { BrandContainer } from "./BrandContainer";
import { Fip } from "./Fip";
import { type Language } from "@lib/types/form-builder-types";

export const GcdsHeader = ({ pathname, language }: { pathname: string; language: Language }) => {
  return (
    <div className="gcds-header__container">
      <header className="gcds-header">
        <BrandContainer>
          <Fip language={language} />
          <LanguageToggle pathname={pathname} language={language} />
        </BrandContainer>
      </header>
    </div>
  );
};
