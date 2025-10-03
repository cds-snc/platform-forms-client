import { LanguageToggle } from "./LanguageToggle";
import { BrandContainer } from "./BrandContainer";
import { Fip } from "./Fip";
import { type Language } from "@lib/types/form-builder-types";
import { SkipLink } from "@root/components/clientComponents/globals";

export const GcdsHeader = ({
  pathname,
  language,
  showLanguageToggle = true,
  skipLink = true,
}: {
  pathname: string;
  language: Language;
  showLanguageToggle?: boolean;
  skipLink?: boolean;
}) => {
  return (
    <div className="gcds-header__container">
      <header className="gcds-header">
        {skipLink && <SkipLink />}
        <BrandContainer>
          <Fip language={language} />
          {showLanguageToggle && <LanguageToggle pathname={pathname} language={language} />}
        </BrandContainer>
      </header>
    </div>
  );
};
