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

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: Element[];
};

type Element = {
  elementId: number;
  title: string;
  values: string;
}

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


// Handles sub elements (repeating sets) where the values may themselves be form elements
function getFormSubElements(elementId: number | null, formValues: void | FormValues, formElements: FormElement[], lang:string) {
  if (!elementId) {
    return [];
  }
  const parentId = parseRootId(elementId, formElements);
  const subElementValues:FormValues = formValues[parentId as keyof typeof formValues];
  const subElements = formElements.find((item) => item.id === parentId)?.properties?.subElements;
  if (!Array.isArray(subElementValues) || !Array.isArray(subElements)) {
    return [];
  }
  // TODO: explain what's going on here
  const temp =  subElementValues.map((subElementValue: string) => {
    return Object.keys(subElementValue).map((keyIndex: string) => {
      return {
        elementId: `${elementId} ${keyIndex}`,  // TODO
        title: (subElements[keyIndex as keyof typeof subElements] as FormElement).properties?.[getLocalizedProperty("title", lang)],
        values: subElementValue[keyIndex as keyof typeof subElementValue],
      };
    });
  })
  return temp;  //TODO TYPES
}

// Handles non-repeating sets (sub elements) form elements
function getReviewItemElements(
  groupElements: string[],
  formElements: FormElement[],
  matchedIds: string[],
  formValues: FormValues,
  lang: string
){
  const shownFormElements = filterShownElements(formElements, matchedIds);
  const shownElementIds = getElementIdsAsNumber(
    filterValuesForShownElements(groupElements, shownFormElements)
  );
  return shownElementIds.map((elementId) => {
    const element = formElements.find((item) => item.id === elementId);
    let resultValues: string | Element[] = getFormElementValues(elementId, formValues);
    
    if (element?.type === FormElementTypes.dynamicRow) {
      resultValues = [];

      // element.properties?.subElements?.forEach(subElement => {
      //   (values as Element[]).push( {
      //     elementId: subElement.id,
      //     title: getFormElementTitle(subElement.id, formElements, lang),
      //     values: getFormSubElements(subElement.id, formValues, formElements, lang),
      //   })
      // })

      const parentId = element.id;
      const parentTitle = element.properties?.[getLocalizedProperty("title", lang)];
      const subElements = element.properties?.subElements;
      const result = formValues[parentId].map((valueRows, valueRowsIndex) => {
        const subElementsTitle = `${parentTitle} - ${valueRowsIndex + 1}`;
        const valueRowsAsArray = Object.keys(valueRows).map(key => valueRows[key]);
        const titleValues = valueRowsAsArray.map((value, valueRowIndex) => {
          return {
            title: subElements[valueRowIndex].properties?.[getLocalizedProperty("title", lang)],
            value: value
          }
        });
        const result = {
          title: subElementsTitle,
          values: titleValues
        }
        return result;
      });

      resultValues.push({
        title: parentTitle,
        values: result
      });
    }

    return {
      elementId,
      title: getFormElementTitle(elementId, formElements, lang),
      values: resultValues,
    };
  });
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
                  // Handle arrays (sub elements)
                  reviewElement.values.map((subElement) => {
                    return subElement.values.map((element:Element[], index:number) => {
                      if (Array.isArray(element.values)) {
                        return element.values.map((titleValues) => {
                          const title = titleValues.title;
                          const values = titleValues.value;
                          return (
                            <div key={title + values} className="mb-2">
                              <dt className="font-bold mb-2">{title}</dt>
                              <dd>{values || "-"}</dd>
                            </div>
                          )
                        })
                      }

                      {/* {JSON.stringify(element)} */}
                      // return (
                      //   <div key={subElement.elementId + index} className="mb-2">
                      //     <dt className="font-bold mb-2">{element[index].title}</dt>
                      //     <dd>{element[index].values || "-"}</dd>
                      //   </div>
                      // )
                      return (
                        <div key={subElement.elementId + index} className="mb-2">
                          <dt className="font-bold mb-2">{element.title}</dt>
                          <dd>{element.values || "-"}</dd>
                        </div>
                      )
                    })
                  }) :
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
