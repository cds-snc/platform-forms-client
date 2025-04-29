import { type Language } from "@lib/types/form-builder-types";

import { SignatureEn } from "./assets/SignatureEn";
import { SignatureFr } from "./assets/SignatureFr";

export const Fip = ({ language, link }: { language: Language; link: string }) => {
  return (
    <div className="gcds-signature brand__signature">
      {language === "en" ? (
        <a href={link}>
          <SignatureEn />
        </a>
      ) : (
        <a href={link}>
          <SignatureFr />
        </a>
      )}
    </div>
  );
};
