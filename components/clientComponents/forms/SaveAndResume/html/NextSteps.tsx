import { type SecurityAttribute } from "@lib/types";
import { type Language } from "@lib/types/form-builder-types";

export const NextSteps = ({
  securityAttribute,
  language,
}: {
  securityAttribute: SecurityAttribute;
  language: Language;
}) => {
  return (
    <div>
      {securityAttribute}
      {language}
    </div>
  );
};
