import { BrandProperties } from "@lib/types";
import { LanguageToggle } from "./LanguageToggle";
import { BrandContainer } from "./BrandContainer";
import { type Language } from "@lib/types/form-builder-types";
import { Brand, SkipLink } from "@root/components/clientComponents/globals";

export const BrandHeader = ({
  brand,
  pathname,
  language,
}: {
  brand: BrandProperties | undefined | null;
  pathname: string;
  language: Language;
}) => {
  return (
    <div className="gcds-header__container">
      <header className="gcds-header">
        {<SkipLink />}
        <BrandContainer>
          <div className="gcds-signature brand__signature">
            <Brand brand={brand} />
          </div>
          <LanguageToggle pathname={pathname} language={language} />
        </BrandContainer>
      </header>
    </div>
  );
};
