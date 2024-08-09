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
import { randomId } from "@lib/client/clientHelpers";

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: Element[];
};

type Element = {
  title: string;
  values: string | Element[];
};

function formatElementValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ") || "-";
  }
  return value || "-";
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
  return shownElementIds.map((elementId) => {
    const element = formElements.find((item) => item.id === elementId);
    let resultValues: string | Element[] = formatElementValue(
      formValues[elementId as unknown as keyof typeof formValues]
    );
    if (element?.type === FormElementTypes.dynamicRow) {
      resultValues = [];
      const parentId = element.id;
      const parentTitle = element.properties?.[getLocalizedProperty("title", lang)];
      const subElements = element.properties?.subElements;
      const subElementValues = (formValues[parentId] as string[]).map(
        (valueRows, valueRowsIndex) => {
          const subElementsTitle = `${parentTitle} - ${valueRowsIndex + 1}`;
          const valueRowsAsArray = Object.keys(valueRows).map(
            (key) => valueRows[key as keyof typeof valueRows]
          );
          // Map the FormValue index to the subElement index to get the Element title
          const titlesMappedToValues = valueRowsAsArray.map((value, valueRowIndex) => {
            return {
              title: subElements?.[valueRowIndex].properties?.[getLocalizedProperty("title", lang)],
              values: value,
            } as Element;
          });
          return {
            title: subElementsTitle,
            values: titlesMappedToValues,
          } as Element;
        }
      );
      resultValues.push({
        title: parentTitle as string,
        values: subElementValues,
      });
    }
    return {
      title: (element?.properties?.[getLocalizedProperty("title", lang)] as string) || "-",
      values: resultValues,
    } as Element;
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
      .filter((key) => key !== "review") // Removed to avoid showing as a group - TODO use remove function
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
        reviewItem.elements.map((reviewElement) => {
          if (Array.isArray(reviewElement.values)) {
            // TODO: look into whether there is a "correct" way to  nest DL's
            return (
              <dl key={randomId()}>
                <SubElements elements={reviewElement.values as Element[]} />
              </dl>
            );
          }

          return (
            <div key={randomId()} className="mb-8">
              <dt className="font-bold mb-2">{reviewElement.title}</dt>
              <dd>{reviewElement.values}</dd>
            </div>
          );
        })}
    </dl>
  );
};

// Handles formatting Sub Elements (a.k.a. Repeating Sets, Dynamic Rows)
const SubElements = ({ elements }: { elements: Element[] }) => {
  return elements?.map((subElementItem) => {
    return (subElementItem.values as Element[])?.map((element) => {
      if (Array.isArray(element.values)) {
        return (
          <dl key={randomId()}>
            {element.title}
            {(element.values as Element[]).map((titleValues) => {
              return (
                <div key={randomId()} className="mb-2">
                  <dt className="font-bold mb-2">{titleValues.title}</dt>
                  <dd>{formatElementValue(titleValues.values as string)}</dd>
                </div>
              );
            })}
          </dl>
        );
      }
      return (
        <div key={randomId()} className="mb-2">
          <dt className="font-bold mb-2">{element.title}</dt>
          <dd>{formatElementValue(element.values)}</dd>
        </div>
      );
    });
  });
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
