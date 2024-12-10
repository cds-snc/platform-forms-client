import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Language } from "@lib/types/form-builder-types";
import { AddressCompleteLabels } from "../AddressComplete/types";
import { EditButton } from "./EditButton";
import { QuestionsAnswersList } from "./QuestionsAnswersList";
import { getReviewItems, ReviewItem } from "./reviewUtils";

export const Review = ({ language }: { language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle, matchedIds } =
    useGCFormsContext();

  // Focus heading on load
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  useFocusIt({ elRef: groupsHeadingRef });

  const addressCompleteStrings = useMemo(() => {
    return {
      streetAddress: t("addressComponents.streetName", { lng: language }),
      city: t("addressComponents.city", { lng: language }),
      province: t("addressComponents.province", { lng: language }),
      postalCode: t("addressComponents.postalCode", { lng: language }),
      provinceOrState: t("addressComponents.provinceOrState", { lng: language }),
      postalCodeOrZip: t("addressComponents.postalCodeOrZip", { lng: language }),
      country: t("addressComponents.country", { lng: language }),
    } as AddressCompleteLabels;
  }, [t, language]);

  const reviewItemsRef = useRef<ReviewItem[]>([]);
  useEffect(() => {
    // TODO move address strings to server lookup in a future async-await call (why async below)
    // and split out functions to be more generic/reusable
    const getItems = async () => {
      reviewItemsRef.current = getReviewItems(
        getValues(),
        groups,
        getGroupHistory(),
        getGroupTitle,
        language,
        formRecord.form.elements,
        matchedIds,
        addressCompleteStrings
      );
    };
    getItems();
  }, [
    groups,
    getValues,
    getGroupHistory,
    getGroupTitle,
    language,
    formRecord.form.elements,
    matchedIds,
    addressCompleteStrings,
  ]);

  return (
    <>
      <h2 ref={groupsHeadingRef} tabIndex={-1}>
        {t("reviewForm", { lng: language })}
      </h2>
      <div className="my-16">
        {Array.isArray(reviewItemsRef.current) &&
          reviewItemsRef.current.map((reviewItem) => {
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
                    reviewItemId={reviewItem.id}
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
                  reviewItemId={reviewItem.id}
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
