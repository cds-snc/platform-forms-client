import { useTranslation } from "@i18n/client";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { Language } from "@lib/types/form-builder-types";
import { BackArrowIcon24x24 } from "@serverComponents/icons";
import { focusHeadingBySelector } from "@lib/client/clientHelpers";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";

export const BackButtonGroup = ({
  language,
  onClick,
  saveAndResumeEnabled,
}: {
  language: Language;
  onClick?: () => void;
  saveAndResumeEnabled?: boolean;
}) => {
  const { currentGroup, getGroupHistory, getPreviousGroup, setGroup } = useGCFormsContext();
  const { t } = useTranslation("form-builder");

  // Only show on Group screens
  if (
    !currentGroup ||
    currentGroup === LOCKED_GROUPS.START ||
    currentGroup === LOCKED_GROUPS.REVIEW ||
    currentGroup === LOCKED_GROUPS.END
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
          const previousGroup = getPreviousGroup(currentGroup);
          setGroup(previousGroup);
          onClick && onClick();
          // Focus the H1 on the start page as the beginning of the page, and then for any other
          // sub page, focus the H2. This works since the start page will not have an H2.
          focusHeadingBySelector(["form h2", "h1"]);
        }}
        type="button"
        className="group mr-4 "
        theme="secondary"
        dataTestId="backButtonGroup"
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
    </>
  );
};
