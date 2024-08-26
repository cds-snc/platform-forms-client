import { useTranslation } from "react-i18next";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/forms";
import { Language } from "@lib/types/form-builder-types";

// Must be placed withing context of the GCFormsContext.Provider
export const BackButton = ({ language, onClick }: { language: Language; onClick?: () => void }) => {
  const { t } = useTranslation("review");
  const { setGroup, previousGroup } = useGCFormsContext();
  return (
    <Button
      type="button"
      secondary={true}
      onClick={() => {
        setGroup(previousGroup);
        onClick && onClick();
      }}
    >
      {t("goBack", { lng: language })}
    </Button>
  );
};
