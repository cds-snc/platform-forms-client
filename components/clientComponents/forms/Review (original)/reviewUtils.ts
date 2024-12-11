import { AddressComponents, FileInputResponse, FormElement, FormElementTypes } from "@lib/types";
import { DateFormat, DateObject } from "../FormattedDate/types";
import { getFormattedDateFromObject } from "../FormattedDate/utils";
import { AddressElements, AddressCompleteLabels } from "../AddressComplete/types";
import { getAddressAsReviewElements, getAddressAsString } from "../AddressComplete/utils";
import { getLocalizedProperty } from "@lib/utils";
import {
  filterShownElements,
  filterValuesForShownElements,
  FormValues,
  getElementIdsAsNumber,
  Group,
  GroupsType,
} from "@lib/formContext";
import { Language } from "@lib/types/form-builder-types";

export type ReviewItem = {
  id: string;
  name: string;
  title: string;
  elements: ReviewElement[];
};

export type ReviewElement = {
  title: string;
  values: string | FileInputResponse | DateObject | ReviewElement[];
  element: FormElement | undefined;
};

export function formatElementValues(element: ReviewElement) {
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

export function getReviewItemElements(
  groupElements: string[],
  formElements: FormElement[],
  matchedIds: string[],
  formValues: FormValues,
  lang: string,
  addressCompleteStrings: AddressCompleteLabels
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
          streetAddress: `${parentTitle} - ${addressCompleteStrings.streetAddress}`,
          city: `${parentTitle} - ${addressCompleteStrings.city}`,
          province: `${parentTitle} - 
            ${
              canadaOnly ? addressCompleteStrings.province : addressCompleteStrings.provinceOrState
            }`,
          postalCode: `${parentTitle} - ${
            canadaOnly ? addressCompleteStrings.postalCode : addressCompleteStrings.postalCodeOrZip
          }`,
          country: `${parentTitle} - ${addressCompleteStrings.country}`,
        } as AddressElements;

        const subAddressValues = getAddressAsReviewElements(addressValues, element, titleSet).map(
          (subAddress) => {
            return {
              title: subAddress.label,
              values: subAddress.values,
              element: subAddress.originalFormElement,
            };
          }
        );

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

export const getReviewItems = (
  formValues: void | FormValues,
  groups: GroupsType | undefined,
  groupHistory: string[],
  getGroupTitle: (groupId: string | null, language: Language) => string,
  language: Language,
  formRecordElements: FormElement[],
  matchedIds: string[],
  addressCompleteStrings: AddressCompleteLabels
) => {
  if (!formValues || !groups) return [];
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
          formRecordElements,
          matchedIds,
          formValues,
          language,
          addressCompleteStrings
        ),
      };
    });
};
