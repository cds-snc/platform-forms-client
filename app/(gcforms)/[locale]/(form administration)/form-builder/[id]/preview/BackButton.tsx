import { useTranslation } from "react-i18next";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { Language } from "@lib/types/form-builder-types";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { BackArrowIcon24x24 } from "@serverComponents/icons";
import { focusHeadingBySelector } from "@lib/client/clientHelpers";

// Must be placed withing context of the GCFormsContext.Provider
export const BackButton = ({
  language,
  onClick,
  saveAndResumeEnabled,
}: {
  language: Language;
  onClick?: () => void;
  saveAndResumeEnabled?: boolean;
}) => {
  const { t } = useTranslation("review");
  const { setGroup, previousGroup, currentGroup } = useGCFormsContext();

  // Do not show on the Review page
  if (!currentGroup || currentGroup !== LockedSections.REVIEW) {
    return <></>;
  }

  return (
    <Button
      theme="secondary"
      className="group mr-4"
      onClick={() => {
        setGroup(previousGroup);
        onClick && onClick();
        focusHeadingBySelector(["form h2", "h1"]);
      }}
      dataTestId="backButton"
    >
      {!saveAndResumeEnabled ? (
        t("goBack", { lng: language })
      ) : (
        <>
          <BackArrowIcon24x24
            className="group-focus:fill-white group-active:fill-white"
            title={t("goBack", { lng: language })}
          />
          <span className="hidden laptop:block">{t("goBack", { lng: language })}</span>
        </>
      )}
    </Button>
  );
};
