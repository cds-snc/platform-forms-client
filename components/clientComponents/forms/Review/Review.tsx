import { useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FileInputResponse, FormElement, FormElementTypes } from "@lib/types";
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
import { DateFormat, DateObject } from "../FormattedDate/types";
import { getFormattedDateFromObject } from "../FormattedDate/utils";

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: ReviewElement[];
};

type ReviewElement = {
  title: string;
  values: string | FileInputResponse | DateObject | ReviewElement[];
  element: FormElement | undefined;
};

function formatElementValues(element: ReviewElement) {
  if (!element.values) {
    return "-";
  }
  // Case of a File upload
  if ((element.values as FileInputResponse).based64EncodedFile !== undefined) {
    const file = element.values as FileInputResponse;
    if (!file.name || !file.size || file.size < 0) {
      return "-";
    }
    const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
    return `${file.name} (${fileSizeInMB} MB)`;
  }

  // Case of a Formatted date
  if (element.element?.type === FormElementTypes.formattedDate) {
    return getFormattedDateFromObject(
      element.element?.properties.dateFormat as DateFormat,
      JSON.parse(element.values as string) as DateObject
    );
  }

  // Case of an array like element e.g. checkbox
  if (Array.isArray(element.values)) {
    return element.values.join(", ") || "-";
  }
  // Case of a single value element e.g. input
  return String(element.values);
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
    const reviewElement: ReviewElement = {
      title: element?.properties?.[getLocalizedProperty("title", lang)] as string,
      values: formValues[elementId as unknown as keyof typeof formValues] as string,
      element,
    };

    let resultValues: string | ReviewElement[] = formatElementValues(reviewElement);

    // Handle any Sub Elements. Note Sub Elements = Dynamic Rows = Repeating Sets
    if (element?.type === FormElementTypes.dynamicRow) {
      resultValues = [];
      const parentId = element.id;
      const parentTitle = element.properties?.[getLocalizedProperty("title", lang)];
      const subElements = element.properties?.subElements;
      // Use FormValues as the source of truth and for each FormValue value, map the related
      // subElement title to the FormValue value
      const subElementValues = (formValues[parentId] as string[]).map(
        (valueRows, valueRowsIndex) => {
          const subElementsTitle = `${parentTitle} - ${valueRowsIndex + 1}`;
          const valueRowsAsArray = Object.keys(valueRows).map(
            (key) => valueRows[key as keyof typeof valueRows]
          );
          // Match the FormValue index to the subElement index to assign the Element title
          const titlesMappedToValues = valueRowsAsArray.map((formValue, valueRowIndex) => {
            return {
              title: subElements?.[valueRowIndex].properties?.[getLocalizedProperty("title", lang)],
              values: formValue,
              element: element,
            };
          });
          return {
            title: subElementsTitle,
            values: titlesMappedToValues,
            element,
          } as ReviewElement;
        }
      );
      resultValues.push({
        title: parentTitle as string,
        values: subElementValues,
        element,
      });
    }
    return {
      title: (element?.properties?.[getLocalizedProperty("title", lang)] as string) || "-",
      values: resultValues,
      element,
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
        reviewItem.elements.map((reviewElement) => {
          if (Array.isArray(reviewElement.values)) {
            return (
              <SubElements key={randomId()} elements={reviewElement.values as ReviewElement[]} />
            );
          }
          return (
            <div key={randomId()} className="mb-8">
              <dt className="mb-2 font-bold">{reviewElement.title}</dt>
              <dd>{reviewElement.values as string}</dd>
            </div>
          );
        })}
    </dl>
  );
};

// Handle formatting Sub Elements. Note Sub Elements = Dynamic Rows = Repeating Sets.
const SubElements = ({ elements }: { elements: ReviewElement[] }) => {
  return elements?.map((subElementItem) => {
    return (subElementItem.values as ReviewElement[])?.map((element) => {
      if (Array.isArray(element.values)) {
        const dlId = randomId();
        // Create a nested DL for each Sub Element list
        return (
          <dl key={dlId} aria-labelledby={dlId} className="my-10">
            <h4 className="italic" id={dlId}>
              {element.title}
            </h4>
            {(element.values as ReviewElement[]).map((elementValues) => {
              return (
                <div key={randomId()} className="mb-2">
                  <dt className="mb-2 font-bold">{elementValues.title}</dt>

                  <dd>{formatElementValues(elementValues)}</dd>
                </div>
              );
            })}
          </dl>
        );
      }
      return (
        <div key={randomId()} className="mb-2">
          <dt className="mb-2 font-bold">{element.title}</dt>
          <dd>{formatElementValues(element)}</dd>
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
