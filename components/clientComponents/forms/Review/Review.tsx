import { useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormElement, FormElementTypes } from "@lib/types";
import { Language } from "@lib/types/form-builder-types";
import { getLocalizedProperty } from "@lib/utils";
import {
  filterShownElements,
  filterValuesForShownElements,
  FormValues,
  getElementIdsAsNumber,
  Group,
} from "@lib/formContext";
import { parseRootId } from "@lib/utils/form-builder/getPath";
import { value } from "valibot";

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: {
    elementId: number;
    title: string;
    values: string;
  }[];
};

function getFormElementValues(elementName: number | null, formValues: void | FormValues) {
  const value = formValues[elementName as keyof typeof formValues];
  if (Array.isArray(value)) {
    return (value as Array<string>).join(", ") || "-";
  }
  return value || "-";
}

function getFormElementTitle(formElementId: number, formElements: FormElement[], lang: string) {
  const formElement = formElements.find((item) => item.id === formElementId);
  return formElement
    ? (formElement.properties?.[getLocalizedProperty("title", lang)] as string)
    : "-";
}

function getFormSubElements(elementId: number | null, formValues: void | FormValues, formElements: FormElement[]) {
  if (!elementId) {
    return [];
  }

  const parentId = parseRootId(elementId, formElements);
  const subElementValues:FormValues = formValues[parentId as keyof typeof formValues];
  const subElements:FormElement = formElements.find((item) => item.id === parentId)?.properties?.subElements;

  if (!Array.isArray(subElementValues) || !Array.isArray(subElements)) {
    return [];
  }

  return subElementValues.map((subElementValue: string) => {
    // const subElementTitle = subElements[index].properties?.titleEn;
    return Object.keys(subElementValue).map((keyIndex: string) => {
      const value = subElementValue[keyIndex as keyof typeof subElementValue];
      const title = subElements[keyIndex as keyof typeof subElements].properties.titleEn;
      return {
        title,
        value,
      };
    });
  })
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
    const element = formElements.find((item) => item.id === elementId);
    let values: string | string[] = getFormElementValues(elementId, formValues);
    
    if (element?.type === FormElementTypes.dynamicRow) {
      values = [];
      element.properties?.subElements?.forEach(subElement => {
        values.push( {
          elementId: subElement.id,
          title: getFormElementTitle(subElement.id, formElements, lang),
          values: getFormSubElements(subElement.id, formValues, formElements), //TODO
        })
      })
    }

    return {
      elementId,
      title: getFormElementTitle(elementId, formElements, lang),
      values,
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
              <dd>{Array.isArray(reviewElement.values) ? 
                // if array do another loop
                reviewElement.values.map((subElement) => {
                  return subElement.values.map((element, index) => {
                    return (
                      <div key={subElement.elementId + index} className="mb-2">
                        <dt className="font-bold mb-2">{element[index].title}</dt>
                        <dd>{element[index].value}</dd>
                      </div>
                    )
                  })
                }):
                
                reviewElement.values
                
                }</dd>
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
