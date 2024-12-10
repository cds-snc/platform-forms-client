import { useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Language } from "@lib/types/form-builder-types";
// import { AddressCompleteLabels } from "../AddressComplete/types";
import { EditButton } from "./EditButton";
import { QuestionsAnswersList } from "./QuestionsAnswersList";
// import { getReviewItems, ReviewItem } from "./reviewUtils";
import { FileInputResponse, FormElement } from "@lib/types";
import { DateObject } from "../FormattedDate/types";
import { filterShownElements, filterValuesForShownElements, FormValues, getElementIdsAsNumber, Group } from "@lib/formContext";
import { getLocalizedProperty } from "@lib/utils";
import { logMessage } from "@lib/logger";

export type ReviewItem = {
  id: string;
  name: string;
  title: string;
  formItems: FormItem[];
};

// FormItems is used by sub Components that decide how to render it e.g. may be an array, or recursive etc.
export type FormItem = {
  label: string;
  values: string | FileInputResponse | DateObject | FormItem[];
  originalFormElement: FormElement | undefined;
};

export const Review = ({ language }: { language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle, matchedIds } =
    useGCFormsContext();

  // Focus heading on load
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  useFocusIt({ elRef: groupsHeadingRef });

  // util general?
  const getFormElements = (elementIds: number[], formElements: FormElement[]) => {
    if (!Array.isArray(elementIds) || !formElements) {
      return [];
    }
    return elementIds.map(elementId => formElements.find((item) => item.id === elementId))
  }

  const reviewItems = useMemo(() => {
    // util specific
    const createFormItems = (formElements:(FormElement | undefined)[], formValues:FormValues) => {
      if (!Array.isArray(formElements) || !formValues) {
        return [];
      }
      return formElements.map(formElement => {
        return {
          label: formElement?.properties?.[getLocalizedProperty("title", language)] as string,
          values: formValues[formElement?.id as unknown as keyof typeof formValues] as string,
          originalFormElement: formElement,
        } as FormItem
      });
    }

    const formValues = getValues();
    if (!formValues || !groups) return {};  // TODO - probably split some of below out - not sure about !groups

    const groupHistoryIds = getGroupHistory();
    const groupsWithElementIds = groupHistoryIds.filter((key) => key !== "review").map(groupId => {
      const group: Group = groups[groupId as keyof typeof groups] || {};
      // Remove any hidden elements from Show-Hide (only include elements interacted with by the user)
      const shownFormElements = filterShownElements(formRecord.form.elements, matchedIds);
      const elementIds = getElementIdsAsNumber(
        filterValuesForShownElements(group.elements, shownFormElements)
      );
      return {
        groupId: groupId,
        group,      // Group with name, title,.. plus elements that may have invisible (not shown elements) - don't use this one
        elementIds  // Group elementIds that are visible (not hidden)
      }
    });

    // Construct and populate the list of Review Items useful for the Review page
    const reviewItems = groupsWithElementIds.map(groupWithElementIds => {
      const formElements = getFormElements(groupWithElementIds.elementIds, formRecord.form.elements);
      const formItems = createFormItems(formElements, formValues);
      return {
        id: groupWithElementIds.groupId,
        name: groupWithElementIds.group.name,
        title: getGroupTitle(groupWithElementIds.groupId, language),
        formItems,
      } as ReviewItem
    });

    logMessage.info("reviewItems", reviewItems);
    return reviewItems;
  },[formRecord.form.elements, getGroupHistory, getGroupTitle, getValues, groups, language, matchedIds])

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
                  <QuestionsAnswersList reviewItem={reviewItem}  language={language} />
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
