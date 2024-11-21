import { useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Language } from "@lib/types/form-builder-types";
import { AddressCompleteLabels } from "../AddressComplete/types";
import { EditButton } from "./EditButton";
import { QuestionsAnswersList } from "./QuestionsAnswersList";
import { getReviewItems, ReviewItem } from "./reviewUtils";

const addressCompleteStrings = {} as AddressCompleteLabels;

export const Review = ({ language }: { language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle, matchedIds } =
    useGCFormsContext();

  // Focus heading on load
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  useFocusIt({ elRef: groupsHeadingRef });

  //Prior to useMemo, we grab the necessary translations for AddressComplete
  addressCompleteStrings.streetAddress = t("addressComponents.streetName", { lng: language });
  addressCompleteStrings.city = t("addressComponents.city", { lng: language });
  addressCompleteStrings.province = t("addressComponents.province", { lng: language });
  addressCompleteStrings.postalCode = t("addressComponents.postalCode", { lng: language });
  addressCompleteStrings.provinceOrState = t("addressComponents.provinceOrState", {
    lng: language,
  });
  addressCompleteStrings.postalCodeOrZip = t("addressComponents.postalCodeOrZip", {
    lng: language,
  });
  addressCompleteStrings.country = t("addressComponents.country", { lng: language });
  //This is done here, as useTranslation is inacessible inside useMemo.

  const reviewItems: ReviewItem[] = useMemo(() => {
    return getReviewItems(
      getValues(),
      groups,
      getGroupHistory(),
      getGroupTitle,
      language,
      formRecord.form.elements,
      matchedIds,
      addressCompleteStrings
    );
  }, [
    groups,
    getValues,
    getGroupHistory,
    getGroupTitle,
    language,
    formRecord.form.elements,
    matchedIds,
  ]);

  return (
    <>
      <h2 ref={groupsHeadingRef} tabIndex={-1}>
        {t("reviewForm", { lng: language })}
      </h2>
      <div className="my-16">
        {Array.isArray(reviewItems) &&
          reviewItems.map((reviewItem) => {
            const title =
              reviewItem.id === "start"
                ? t("logic.start", { ns: "common", lng: language })
                : reviewItem.title;
            return (
              <div
                key={reviewItem.id}
                className="mb-10 rounded-lg border-2 border-slate-400 px-6 py-4"
              >
                <h3 className="text-slate-700">
                  <EditButton
                    reviewItem={reviewItem}
                    theme="link"
                    onClick={() => {
                      groupsHeadingRef.current?.focus();
                    }}
                  >
                    {title}
                  </EditButton>
                </h3>
                <div className="mb-10 ml-1">
                  <QuestionsAnswersList reviewItem={reviewItem} />
                </div>
                <EditButton
                  reviewItem={reviewItem}
                  theme="secondary"
                  onClick={() => {
                    groupsHeadingRef.current?.focus();
                  }}
                >
                  {t("edit", { lng: language })}
                </EditButton>
              </div>
            );
          })}
      </div>
    </>
  );
};
