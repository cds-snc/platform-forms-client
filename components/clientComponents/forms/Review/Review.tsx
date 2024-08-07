import { useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormElement } from "@lib/types";
import { Language } from "@lib/types/form-builder-types";
import { getLocalizedProperty } from "@lib/utils";
import {
  filterShownElements,
  filterValuesForShownElements,
  FormValues,
  getElementIdsAsNumber,
  Group,
} from "@lib/formContext";

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: {
    elementId: number;
    title: string;
    values: string | { based64EncodedFile: string; name: string; size: number };
  }[];
};

function getFormElementValues(elementName: number | null, formValues: void | FormValues) {
  const value = formValues[elementName as keyof typeof formValues];
  if (Array.isArray(value)) {
    return "Huzzah"; // return (value as Array<string>).join(", ") || "-";
  }
  return value || "-";
}

function getFormElementTitle(formElementId: number, formElements: FormElement[], lang: string) {
  const formElement = formElements.find((item) => item.id === formElementId);
  return formElement
    ? (formElement.properties?.[getLocalizedProperty("title", lang)] as string)
    : "-";
}

function getReviewItemElements(
  groupElements: string[],
  formElements: FormElement[],
  matchedIds: string[],
  formValues: FormValues,
  lang: string
) {
  const shownFormElements = filterShownElements(formElements, matchedIds);
  const shownElementIds = getElementIdsAsNumber(
    filterValuesForShownElements(groupElements, shownFormElements)
  );
  const result = shownElementIds.map((elementId) => {
    return {
      elementId,
      title: getFormElementTitle(elementId, formElements, lang),
      values: getFormElementValues(elementId, formValues),
    };
  });
  return result;
}

export const Review = ({ language }: { language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle, matchedIds } =
    useGCFormsContext();

  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef });

  const reviewItems: ReviewItem[] = useMemo(() => {
    const formValues: void | FormValues = getValues();
    if (!formValues || !groups) return [];

    const groupHistory = getGroupHistory();
    return groupHistory
      .filter((key) => key !== "review") // Removed to avoid showing as a group
      .map((groupId) => {
        const group: Group = groups[groupId as keyof typeof groups];
        return {
          id: groupId,
          name: group.name,
          title: getGroupTitle(groupId, language),
          elements: getReviewItemElements(
            group.elements,
            formRecord.form.elements,
            matchedIds,
            formValues,
            language
          ),
        };
      });
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
      <h2 ref={headingRef}>{t("reviewForm", { lng: language })}</h2>
      <div className="my-16">
        {Array.isArray(reviewItems) &&
          reviewItems.map((reviewItem) => {
            const title = reviewItem.title
              ? reviewItem.title
              : t("start", { ns: "common", lng: language });
            return (
              <div
                key={reviewItem.id}
                className="mb-10 rounded-lg border-2 border-slate-400 px-6 py-4"
              >
                <h3 className="text-slate-700">
                  <EditButton reviewItem={reviewItem} theme="link">
                    {title}
                  </EditButton>
                </h3>
                <div className="mb-10 ml-1">
                  <QuestionsAnswersList reviewItem={reviewItem} />
                </div>
                <EditButton reviewItem={reviewItem} theme="secondary">
                  {t("edit", { lng: language })}
                </EditButton>
              </div>
            );
          })}
      </div>
    </>
  );
};

const QuestionsAnswersList = ({ reviewItem }: { reviewItem: ReviewItem }): React.ReactElement => {
  return (
    <dl className="my-10">
      {Array.isArray(reviewItem.elements) &&
        reviewItem.elements.map((reviewElement) => {
          return (
            <div key={reviewElement.elementId} className="mb-8">
              <dt className="font-bold mb-2">{reviewElement.title}</dt>
              <dd>
                {reviewElement.values.based64EncodedFile
                  ? reviewElement.values.name
                  : reviewElement.values}
              </dd>
            </div>
          );
        })}
    </dl>
  );
};

const EditButton = ({
  reviewItem,
  theme,
  children,
}: {
  reviewItem: ReviewItem;
  theme: Theme;
  children: React.ReactElement | string;
}): React.ReactElement => {
  const { setGroup, clearHistoryAfterId } = useGCFormsContext();
  return (
    <Button
      type="button"
      theme={theme}
      onClick={() => {
        setGroup(reviewItem.id);
        clearHistoryAfterId(reviewItem.id);
      }}
    >
      {children}
    </Button>
  );
};
