import { useTranslation } from "@i18n/client";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { Language } from "@lib/types/form-builder-types";
import { BackArrowIcon24x24 } from "@serverComponents/icons";

export const BackButtonGroup = ({
  language,
  onClick,
  saveAndResumeEnabled,
}: {
  language: Language;
  onClick?: () => void;
  saveAndResumeEnabled?: boolean;
}) => {
  const { currentGroup, getGroupHistory, handlePreviousAction } = useGCFormsContext();
  const { t } = useTranslation("form-builder");

  // Only show on Group screens
  if (
    !currentGroup ||
    currentGroup === LockedSections.START ||
    currentGroup === LockedSections.REVIEW ||
    currentGroup === LockedSections.END
  ) {
    return <></>;
  }

  return (
    <>
      {/* For debugging */}
      <div className="hidden">
        {`currentGroup=${currentGroup}, groupHistory=${JSON.stringify(getGroupHistory())}`}
      </div>
      <Button
        onClick={async (e) => {
          e.preventDefault();
          handlePreviousAction();
          onClick && onClick();
        }}
        type="button"
        className="group mr-4"
        theme="secondary"
      >
        {!saveAndResumeEnabled ? (
          t("goBack", { lng: language })
        ) : (
          <>
            <span className="hidden tablet:block">{t("goBack", { lng: language })}</span>
            <span className="block tablet:hidden">
              <BackArrowIcon24x24
                className="group-focus:fill-white group-active:fill-white"
                title={t("goBack", { lng: language })}
              />
            </span>
          </>
        )}
      </Button>
    </>
  );
};
