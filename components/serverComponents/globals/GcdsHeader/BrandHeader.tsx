import { BrandProperties } from "@lib/types";
import { LanguageToggle } from "./LanguageToggle";
import { BrandContainer } from "./BrandContainer";
import { type Language } from "@lib/types/form-builder-types";
import { Brand, SkipLink } from "@root/components/clientComponents/globals";

export const BrandHeader = ({
  brand,
  pathname,
  language,
  showLanguageToggle = true,
  skipLink = true,
}: {
  brand: BrandProperties | undefined | null;
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
          <div className="gcds-signature brand__signature" data-testid="fip">
            <Brand brand={brand} />
          </div>
          {showLanguageToggle && <LanguageToggle pathname={pathname} language={language} />}
        </BrandContainer>
      </header>
    </div>
  );
};
