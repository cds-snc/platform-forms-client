import { useTranslation } from "@i18n/client";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { Language } from "@lib/types/form-builder-types";

export const BackButtonGroup = ({
  language,
  onClick,
}: {
  language: Language;
  onClick?: () => void;
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
        className="mr-4"
        theme="secondary"
      >
        {t("goBack", { lng: language })}
      </Button>
    </>
  );
};
