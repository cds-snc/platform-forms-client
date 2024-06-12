import { useTranslation } from "@i18n/client";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";

export const BackButtonGroup = () => {
  const { currentGroup, getGroupHistory, previousGroup, setGroup } = useGCFormsContext();
  const { t } = useTranslation("form-builder");

  if (
    !currentGroup ||
    currentGroup === LockedSections.START ||
    currentGroup === LockedSections.REVIEW ||
    currentGroup === LockedSections.END

    // TODO create a hasPreviousAction function
    // || !hasNextAction(currentGroup)
  ) {
    return <></>;
  }

  // TODO handle case of using review page > edit (to go back) > then trying to go back more

  return (
    <>
      {/* For debugging */}
      <div className="hidden">
        DEBUGGING: {`currentGroup=${currentGroup}`},
        {`groupHistory=${JSON.stringify(getGroupHistory())}`}
      </div>
      <Button
        onClick={async (e) => {
          e.preventDefault();
          setGroup(previousGroup);
        }}
        type="button"
        className="mr-4"
        theme="secondary"
      >
        {t("back")}
      </Button>
    </>
  );
};
