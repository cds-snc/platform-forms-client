import { type Language } from "@lib/types/form-builder-types";

import { SignatureEn } from "./assets/SignatureEn";
import { SignatureFr } from "./assets/SignatureFr";

export const Fip = ({ language }: { language: Language }) => {
  return (
    <div className="gcds-signature">
      {language === "en" ? (
        <a href="">
          <div>
            <SignatureEn />
          </div>
        </a>
      ) : (
        <a href="">
          <div>
            <SignatureFr />
          </div>
        </a>
      )}
    </div>
  );
};
