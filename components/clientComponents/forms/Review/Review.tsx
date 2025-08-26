import { useRef } from "react";

import { type Language } from "@lib/types/form-builder-types";
import { type FormValues } from "@gcforms/types";

import { getValuesWithMatchedIds, getVisibleGroupsBasedOnValuesRecursive } from "@gcforms/core";

import { type Theme } from "@clientComponents/globals/Buttons/themes";
import { useTranslation } from "@i18n/client";

import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { ReviewList } from "./ReviewList";
import { getReviewItems } from "./helpers";

import { EditButton } from "./EditButton";
import { focusHeadingBySelector } from "@lib/client/clientHelpers";

export const Review = ({ language }: { language: Language }): React.ReactElement | null => {
  const { groups, getValues, formRecord } = useGCFormsContext();
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  const { t } = useTranslation(["review", "common"]);

  const formValues: void | FormValues = getValues();

  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  const valuesWithMatchedIds = getValuesWithMatchedIds(formRecord.form.elements, formValues);

  const groupHistoryIds = getVisibleGroupsBasedOnValuesRecursive(
    formRecord,
    valuesWithMatchedIds,
    "start"
  );

  const reviewItems = getReviewItems({
    formRecord: formRecord,
    formValues,
    groups,
    groupHistoryIds,
    language,
  });

  const renderEditButton = ({ id, title, theme }: { id: string; title?: string; theme: Theme }) => {
    const editText = t("edit", { lng: language });

    return (
      <EditButton
        reviewItemId={id}
        theme={theme}
        onClick={() => {
          focusHeadingBySelector(["form h2", "h1"]);
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
