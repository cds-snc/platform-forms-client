import { useRef } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { AddressComponents, FileInputResponse, FormElement, FormElementTypes } from "@lib/types";
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
import { AddressElements, AddressCompleteLabels } from "../AddressComplete/types";
import { getAddressAsReviewElements, getAddressAsString } from "../AddressComplete/utils";

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

const addressCompleteStrings = {} as AddressCompleteLabels;

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

  // Case of Address Complete
  if (element.element?.type === FormElementTypes.addressComplete) {
    if (element.element.properties?.addressComponents?.splitAddress === true) {
      return element.values as string; // We're a split address, broken into components.
    } else {
      return getAddressAsString(JSON.parse(element.values as string) as AddressElements);
    }
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

    // Handle Address Complete if broken into sub-components.
    if (element?.type === FormElementTypes.addressComplete) {
      const addressComponents = element.properties?.addressComponents as AddressComponents;

      if (addressComponents && addressComponents.splitAddress === true) {
        // We're a split address, broken into components.
        const parentTitle = element.properties?.[getLocalizedProperty("title", lang)];

        const addressFormValue = formValues[elementId] as string;
        const addressValues = JSON.parse(addressFormValue) as AddressElements;
        const canadaOnly = element.properties?.addressComponents?.canadianOnly;

        const titleSet = {
          streetAddress: parentTitle + " - " + addressCompleteStrings.streetAddress,
          city: parentTitle + " - " + addressCompleteStrings.city,
          province:
            parentTitle +
            " - " +
            (canadaOnly ? addressCompleteStrings.province : addressCompleteStrings.provinceOrState),
          postalCode:
            parentTitle +
            " - " +
            (canadaOnly
              ? addressCompleteStrings.postalCode
              : addressCompleteStrings.postalCodeOrZip),
          country: parentTitle + " - " + addressCompleteStrings.country,
        } as AddressElements;

        const subAddressValues = getAddressAsReviewElements(
          addressValues,
          element,
          titleSet
        ) as ReviewElement[];

        resultValues = [];

        resultValues.push({
          title: parentTitle as string,
          values: subAddressValues,
          element,
        });
      }
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

  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  // Focus heading on load
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

  const formValues: void | FormValues = getValues();

  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  const groupHistory = getGroupHistory();
  const reviewItems: ReviewItem[] = groupHistory
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
  onClick,
}: {
  reviewItem: ReviewItem;
  theme: Theme;
  children: React.ReactElement | string;
  onClick?: () => void;
}): React.ReactElement => {
  const { setGroup, clearHistoryAfterId } = useGCFormsContext();
  return (
    <Button
      type="button"
      theme={theme}
      onClick={() => {
        setGroup(reviewItem.id);
        clearHistoryAfterId(reviewItem.id);
        // Focus groups heading on navigation
        onClick && onClick();
      }}
    >
      {children}
    </Button>
  );
};
