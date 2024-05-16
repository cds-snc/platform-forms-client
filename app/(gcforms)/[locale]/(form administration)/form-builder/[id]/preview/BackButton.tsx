import { useTranslation } from "react-i18next";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/forms";

// Must be placed withing context of the GCFormsContext.Provider
export const BackButton = () => {
  const { t } = useTranslation("review");
  const { setGroup, previousGroup } = useGCFormsContext();
  return (
    <Button
      type="button"
      secondary={true}
      onClick={() => {
        setGroup(previousGroup);
      }}
    >
      {t("goBack")}
    </Button>
  );
};
