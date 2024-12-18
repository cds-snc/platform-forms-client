import { useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Language } from "@lib/types/form-builder-types";
import { EditButton } from "./EditButton";
import { FormItemFactory } from "./FormItemFactory";
import { FormItem, getGroupsWithElementIds, getReviewItems } from "./helpers";
import { FormValues } from "@lib/formContext";

export const Review = ({ language }: { language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle, matchedIds } =
    useGCFormsContext();

  // Focus heading on load
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  useFocusIt({ elRef: groupsHeadingRef });

  const formValues: void | FormValues = getValues();
  const groupHistoryIds = getGroupHistory();
  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  // Get Review Items that are used below to print out each question-answer by element type
  const groupsWithElementIds = getGroupsWithElementIds(
    formRecord.form.elements,
    formValues,
    groups,
    groupHistoryIds,
    matchedIds
  );
  const reviewItems = getReviewItems(
    formRecord.form.elements,
    formValues,
    groupsWithElementIds,
    language,
    getGroupTitle
  );

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
                  {reviewItem.formItems &&
                    reviewItem.formItems.map((formItem: FormItem) => (
                      <FormItemFactory
                        key={formItem.element?.id}
                        formItem={formItem}
                        language={language}
                      />
                    ))}
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
