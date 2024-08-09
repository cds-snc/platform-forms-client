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

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: Element[];
};

type Element = {
  title: string;
  values: string | Element[];
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

      const parentId = element.id;
      const parentTitle = element.properties?.[getLocalizedProperty("title", lang)];
      const subElements = element.properties?.subElements;
      const result = (formValues[parentId] as string[]).map((valueRows, valueRowsIndex) => {
        const subElementsTitle = `${parentTitle} - ${valueRowsIndex + 1}`;
        const valueRowsAsArray = Object.keys(valueRows).map(key => valueRows[key as keyof typeof valueRows]);
        const titleValues = valueRowsAsArray.map((value, valueRowIndex) => {
          return {
            title: subElements?.[valueRowIndex].properties?.[getLocalizedProperty("title", lang)],
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
        title: parentTitle as string,
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
        const group: Group = groups[groupId as keyof typeof groups] || {};
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
        reviewItem.elements.map((reviewElement, index) => {
          return (
            <div key={reviewElement.title + index} className="mb-8">
              <dt className="font-bold mb-2">{reviewElement.title}</dt>
              <dd>{Array.isArray(reviewElement.values) ? 
                  // Handle Sub Elements
                  reviewElement.values.map((subElement) => {
                    return (subElement.values as Element[]).map((element, index) => {
                      // Dynamic Row
                      if (Array.isArray(element.values)) {
                        return <SubElement key={subElement.title + index} element={element} />
                      }
                      // Regular Element
                      return (
                        <div key={subElement.title + index} className="mb-2">
                          <dt className="font-bold mb-2">{element.title}</dt>
                          <dd>{String(element.values) || "-"}</dd>
                        </div>
                      )
                    })
                  }) :
                  // Regular Element
                  reviewElement.values
                }</dd>
            </div>
          );
        })}
    </dl>
  );
};

const SubElement = ({element}:{element:Element}) => {
  if (Array.isArray(element.values)) {
    <div>
      {element.title}
      "-"
    </div>
  }
  const listItems = (element.values as Element[]).map((titleValues) => {
    const title = titleValues.title;
    const values = titleValues.value; // TODO: Do I mean values?
    return (
      <div key={title + values} className="mb-2">
        <dt className="font-bold mb-2">{title}</dt>
        <dd>{values || "-"}</dd>
      </div>
    )
  });
  return (
    <div>
      {element.title}
      {listItems}
    </div>
  )
}

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
