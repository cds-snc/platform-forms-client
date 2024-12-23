import { FormValues } from "@lib/formContext";
import { FormItem } from "../../helpers";
import { Language } from "@lib/types/form-builder-types";
import { getLocalizedProperty } from "@lib/utils";

export const getReviewSectionFromDynamicRows = (
  formItem: FormItem,
  formValues: FormValues | void,
  language: Language
) => {
  const element = formItem.element;

  if (!formValues || !element) {
    return null;
  }

  const parentId = element.id;
  const parentTitle = element.properties?.[getLocalizedProperty("title", language)];
  const childTitle =
    element.properties?.dynamicRow?.[
      getLocalizedProperty("rowTitle", language) as keyof typeof getLocalizedProperty
    ];
  const subElements = element.properties?.subElements;

  // Get the children elements of the Dynamic Row
  const subFormItems = (formValues[parentId] as string[]).map((valueRows, parentRowIndex) => {
    // Use FormValues as the source of truth and for each FormValue value, map the related
    // subElement title to the FormValue value
    const valueRowsAsArray = Object.keys(valueRows).map(
      (key) => valueRows[key as keyof typeof valueRows]
    );

    // Create the children Form Items (Dynamic Rows)
    const childFormItems = valueRowsAsArray.map((formValue, childRowIndex) => {
      const subElement = subElements?.[childRowIndex];
      // Match the FormValue index to the subElement index to assign the label
      const label = subElement?.properties?.[getLocalizedProperty("title", language)];
      return {
        type: subElement?.type,
        label,
        values: formValue,
        element: subElement,
      } as FormItem;
    });

    // Create the Parent Form Item (Dynamic Row)
    return {
      type: element.type,
      label: `${childTitle} - ${parentRowIndex + 1}`,
      values: childFormItems,
      element,
    } as FormItem;
  });

  // Add the chidlren Dynamic Rows to the parent Dynamic Row
  return {
    type: element.type,
    label: parentTitle as string,
    values: subFormItems,
    element,
  } as FormItem;
};
