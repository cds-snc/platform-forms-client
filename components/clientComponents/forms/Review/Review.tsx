import { useRef } from "react";

import { type Language } from "@lib/types/form-builder-types";
import { type FormValues } from "@lib/formContext";
import { type Theme } from "@clientComponents/globals/Buttons/themes";
import { useTranslation } from "@i18n/client";

import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { ReviewList } from "./ReviewList";
import { getReviewItems } from "./helpers";

import { EditButton } from "./EditButton";
import { tryFocusOnPageLoad } from "@lib/client/clientHelpers";

export const Review = ({ language }: { language: Language }): React.ReactElement | null => {
  const { groups, getValues, formRecord, getGroupHistory, matchedIds } = useGCFormsContext();
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  const { t } = useTranslation(["review", "common"]);

  // Focus heading on load
  useFocusIt({ elRef: groupsHeadingRef });

  const formValues: void | FormValues = getValues();
  const groupHistoryIds = getGroupHistory();
  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  const reviewItems = getReviewItems({
    formElements: formRecord.form.elements,
    formValues,
    groups,
    groupHistoryIds,
    matchedIds,
    language,
  });

  const renderEditButton = ({ id, title, theme }: { id: string; title?: string; theme: Theme }) => {
    const editText = t("edit", { lng: language });

    return (
      <EditButton
        reviewItemId={id}
        theme={theme}
        onClick={() => {
          tryFocusOnPageLoad("h2");
        }}
      >
        {title ? title : editText}
      </EditButton>
    );
  };

  return (
    <>
      <h2 ref={groupsHeadingRef} tabIndex={-1}>
        {t("reviewForm", { lng: language })}
      </h2>
      <ReviewList
        startSectionTitle={t("logic.start", { lng: language, ns: "common" })}
        language={language}
        reviewItems={reviewItems}
        groupsHeadingRef={groupsHeadingRef}
        renderEditButton={renderEditButton}
      />
    </>
  );
};
