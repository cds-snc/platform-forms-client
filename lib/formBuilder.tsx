"use client";

import React, { ReactElement, type JSX } from "react";
import { DynamicGroup, ConditionalWrapper } from "@clientComponents/forms";
import { FormElement, FormElementTypes, PublicFormRecord, Responses, Response } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import { getPlugin } from "@root/plugins/form-elements/registry";
import type { Language } from "@lib/types/form-builder-types";

// This function renders the form elements with passed in properties.
function _buildForm(element: FormElement, lang: string): ReactElement {
  const id = element.subId ?? element.id;

  // Plugin-first dispatch: registered plugins take priority over the legacy switch.
  // Plugin ViewerComponents are fully self-contained — none of the legacy variables below are used.
  const plugin = getPlugin(element.type);
  if (plugin) {
    const { ViewerComponent } = plugin;
    return <ViewerComponent element={element} language={lang as Language} />;
  }

  const subElements =
    element.properties && element.properties.subElements ? element.properties.subElements : [];

  const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();

  const placeHolderPerLocale = element.properties[getLocalizedProperty("placeholder", lang)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  switch (element.type) {
    case FormElementTypes.dynamicRow: {
      let rowTitle: string | undefined = undefined;
      let addButtonText: string | undefined = undefined;
      let removeButtonText: string | undefined = undefined;

      // Noting "legacy" form elements do not have the dynamicRow property
      // The "placeHolder" is used as the row label
      const props = element.properties.dynamicRow;

      if (typeof props !== "undefined") {
        const rowTitleProp = getLocalizedProperty("rowTitle", lang) as "rowTitleEn" | "rowTitleFr";

        const addButtonProp = getLocalizedProperty("addButtonText", lang) as
          | "addButtonTextEn"
          | "addButtonTextFr";
        const removeButtonProp = getLocalizedProperty("removeButtonText", lang) as
          | "removeButtonTextEn"
          | "removeButtonTextFr";

        rowTitle = props[rowTitleProp];
        addButtonText = props[addButtonProp];
        removeButtonText = props[removeButtonProp];
      }

      return (
        <DynamicGroup
          name={`${id}`}
          title={labelText}
          description={description}
          rowLabel={rowTitle ? rowTitle : placeHolder}
          addButtonText={addButtonText}
          removeButtonText={removeButtonText}
          rowElements={subElements}
          lang={lang}
          maxNumberOfRows={element.properties.maxNumberOfRows}
        />
      );
    }
    default:
      return <></>;
  }
}

/**
 * DynamicForm calls this function to build the entire form, from JSON
 * getRenderedForm
 * @param formRecord
 * @param language
 */
export const getRenderedForm = (formRecord: PublicFormRecord, language: string) => {
  return formRecord.form.layout
    .map((item: number) => {
      const element = formRecord.form.elements.find((element: FormElement) => element.id === item);
      if (element) {
        return <GenerateElement key={element.id} element={element} language={language} />;
      }
    })
    .filter((element): element is JSX.Element => typeof element !== "undefined");
};

/**
 * getFormInitialValues calls this function to set the initial value for an element
 * @param element
 * @param language
 */
const _getElementInitialValue = (element: FormElement, language: string): Response => {
  switch (element.type) {
    // Radio and dropdown resolve to string values
    case FormElementTypes.radio:
    case FormElementTypes.dropdown:
    case FormElementTypes.combobox:
    case FormElementTypes.formattedDate:
    case FormElementTypes.textField:
    case FormElementTypes.numberInput:
    case FormElementTypes.textArea:
    case FormElementTypes.addressComplete:
      return "";
    case FormElementTypes.checkbox:
      return [];
    case FormElementTypes.fileInput:
      return { name: null, size: null, content: null };
    case FormElementTypes.dynamicRow: {
      const dynamicRowInitialValue: Responses =
        element.properties.subElements?.reduce((accumulator, currentValue, currentIndex) => {
          const subElementID = `${currentIndex}`;
          const richTextElements: FormElementTypes[] = [FormElementTypes.richText];
          if (!richTextElements.includes(currentValue.type)) {
            accumulator[subElementID] = _getElementInitialValue(currentValue, language);
          }
          return accumulator;
        }, {} as Responses) ?? {};
      return [dynamicRowInitialValue];
    }
    default:
      throw `Initial value for component ${element.type} is not handled`;
  }
};

/**
 * DynamicForm calls this function to set the initial form values
 * getFormInitialValues
 * @param formRecord
 * @param language
 */
export const getFormInitialValues = (formRecord: PublicFormRecord, language: string): Responses => {
  if (!formRecord?.form) {
    return {};
  }

  const initialValues: Responses = {};

  const richTextElements: FormElementTypes[] = [FormElementTypes.richText];

  formRecord.form.elements
    .filter((element) => !richTextElements.includes(element.type))
    .forEach((element: FormElement) => {
      initialValues[element.id] = _getElementInitialValue(element, language);
    });

  // Used to track the current group dynamically
  initialValues.currentGroup = "";

  // Used to track the group history dynamically
  initialValues.groupHistory = [];

  // Used to track the Ids of elements from show/hide that should be included (visible) dynamically
  initialValues.matchedIds = [];

  return initialValues;
};

type GenerateElementProps = {
  element: FormElement;
  language: string;
};
export const GenerateElement = (props: GenerateElementProps): React.ReactElement => {
  const { element, language } = props;
  const generatedElement = _buildForm(element, language);
  return (
    <ConditionalWrapper
      element={element}
      rules={element.properties.conditionalRules || null}
      lang={language}
    >
      {generatedElement}
    </ConditionalWrapper>
  );
};
