import React, { ReactElement, type JSX } from "react";
import { logMessage } from "@lib/logger";
import {
  Description,
  Dropdown,
  DynamicGroup,
  FileInput,
  FormGroup,
  Label,
  MultipleChoiceGroup,
  RichText,
  TextArea,
  TextInput,
  ConditionalWrapper,
  Combobox,
  FormattedDate,
} from "@clientComponents/forms";
import {
  FormElement,
  FormElementTypes,
  PropertyChoices,
  PublicFormRecord,
  Responses,
  Response,
} from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import { managedData } from "@lib/managedData";
import { AddressComplete } from "@clientComponents/forms/AddressComplete/AddressComplete";
import { DateFormat } from "@clientComponents/forms/FormattedDate/types";

// This function is used for select/radio/checkbox i18n change of form labels
function getLocaleChoices(choices: Array<PropertyChoices> | undefined, lang: string) {
  try {
    if (!choices || !choices.length) {
      return [];
    }

    return choices.map((choice) => {
      return choice[lang];
    });
  } catch (err) {
    logMessage.error(err as Error);
    throw err;
  }
}

// This function renders the form elements with passed in properties.
function _buildForm(element: FormElement, lang: string): ReactElement {
  const id = element.subId ?? element.id;

  let choices =
    element.properties && element.properties.choices
      ? getLocaleChoices(element.properties.choices, lang)
      : [];

  // Retrieve managed data from static json file if specified
  if (element.properties.managedChoices) {
    const dataFile = element.properties.managedChoices;
    const data = managedData[dataFile];
    choices = data ? getLocaleChoices(data, lang) : [];
  }

  const subElements =
    element.properties && element.properties.subElements ? element.properties.subElements : [];

  const isRequired: boolean = element.properties.validation
    ? element.properties.validation.required
    : false;

  const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();
  const labelComponent = labelText ? (
    <Label
      key={`label-${id}`}
      id={`label-${id}`}
      htmlFor={`${id}`}
      className={isRequired ? "required" : ""}
      required={isRequired}
      validation={element.properties.validation}
      group={["radio", "checkbox"].indexOf(element.type) !== -1}
      lang={lang}
    >
      {labelText}
    </Label>
  ) : null;

  const textType =
    element.properties?.validation?.type &&
    ["email", "name", "number", "password", "search", "tel", "url"].includes(
      element.properties.validation.type
    )
      ? element.properties.validation.type
      : "text";

  const spellCheck =
    element.properties?.autoComplete &&
    [
      "email",
      "name",
      "tel",
      "given-name",
      "additional-name",
      "family-name",
      "address-line1",
      "address-level2",
      "address-level1",
      "postal-code",
    ].includes(element.properties?.autoComplete)
      ? false
      : undefined;

  const placeHolderPerLocale = element.properties[getLocalizedProperty("placeholder", lang)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  const sortOrder = element.properties.sortOrder ? element.properties.sortOrder.toString() : "none";

  switch (element.type) {
    case FormElementTypes.textField:
      return (
        <div className="focus-group gcds-input-wrapper">
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <TextInput
            type={textType}
            spellCheck={spellCheck}
            id={`${id}`}
            name={`${id}`}
            required={isRequired}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            placeholder={placeHolder.toString()}
            autoComplete={element.properties.autoComplete?.toString()}
            maxLength={element.properties.validation?.maxLength}
          />
        </div>
      );
    case FormElementTypes.textArea:
      return (
        <div className="focus-group gcds-textarea-wrapper">
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <TextArea
            id={`${id}`}
            name={`${id}`}
            required={isRequired}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            placeholder={placeHolder.toString()}
            maxLength={element.properties.validation?.maxLength}
          />
        </div>
      );
    case FormElementTypes.checkbox: {
      const checkboxItems = choices.map((choice, index) => {
        return {
          key: `${id}.${index}`,
          id: `${id}.${index}`,
          name: `${id}`,
          label: choice,
          required: isRequired,
        };
      });

      return (
        <FormGroup name={`${id}`} ariaDescribedBy={description ? `desc-${id}` : undefined}>
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <MultipleChoiceGroup
            type={FormElementTypes.checkbox}
            name={`${id}`}
            choicesProps={checkboxItems}
          />
        </FormGroup>
      );
    }
    case FormElementTypes.radio: {
      const radioItems = choices.map((choice, index) => {
        return {
          key: `${id}.${index}`,
          id: `${id}.${index}`,
          name: `${id}`,
          label: choice,
          required: isRequired,
        };
      });

      return (
        <FormGroup name={`${id}`} ariaDescribedBy={description ? `desc-${id}` : undefined}>
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <MultipleChoiceGroup
            type={FormElementTypes.radio}
            name={`${id}`}
            choicesProps={radioItems}
          />
        </FormGroup>
      );
    }
    case FormElementTypes.dropdown:
      return (
        <div className="focus-group">
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <Dropdown
            id={`${id}`}
            sortOrder={sortOrder}
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            choices={choices}
            lang={lang}
          />
        </div>
      );
    case FormElementTypes.richText:
      return (
        <>
          {labelText && <h3>{labelText}</h3>}
          <RichText>{description}</RichText>
        </>
      );
    case FormElementTypes.fileInput:
      return (
        <div className="focus-group">
          {labelText && (
            <Label
              key={`label-${id}`}
              id={`label-${id}`}
              className={isRequired ? "required" : ""}
              required={isRequired}
              lang={lang}
              htmlFor={`${id}`}
            >
              {labelText}
            </Label>
          )}
          {description && <Description id={`desc-${id}`}>{description}</Description>}
          <FileInput
            id={`${id}`}
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : `label-${id}`}
            fileType={element.properties.fileType}
            required={isRequired}
            lang={lang}
          />
        </div>
      );
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
    case FormElementTypes.combobox: {
      return (
        <div className="focus-group">
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <Combobox
            id={`${id}`}
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            className="relative"
            choices={choices}
            key={`${id}-${lang}`}
          />
        </div>
      );
    }
    case FormElementTypes.addressComplete: {
      const addressComponents = element.properties.addressComponents;
      return (
        <div className="focus-group">
          <AddressComplete
            label={labelText}
            id={`${id}`}
            name={`${id}`}
            ariaDescribedBy={description}
            key={`${id}-${lang}`}
            splitAddress={addressComponents?.splitAddress}
            canadianOnly={addressComponents?.canadianOnly}
            required={isRequired}
            lang={lang}
          />
        </div>
      );
    }
    case FormElementTypes.formattedDate: {
      return (
        <div className="focus-group">
          <FormattedDate
            label={labelText}
            description={description}
            id={`${id}`}
            name={`${id}`}
            required={isRequired}
            dateFormat={
              element.properties.dateFormat
                ? (element.properties.dateFormat as DateFormat)
                : undefined
            }
            autocomplete={element.properties.autoComplete}
            lang={lang}
          />
        </div>
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
    case FormElementTypes.textArea:
    case FormElementTypes.addressComplete:
      return "";
    case FormElementTypes.checkbox:
      return [];
    case FormElementTypes.fileInput:
      return { name: null, size: null, based64EncodedFile: null };
    case FormElementTypes.dynamicRow: {
      const dynamicRowInitialValue: Responses =
        element.properties.subElements?.reduce((accumulator, currentValue, currentIndex) => {
          const subElementID = `${currentIndex}`;
          if (![FormElementTypes.richText].includes(currentValue.type)) {
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

  formRecord.form.elements
    .filter((element) => ![FormElementTypes.richText].includes(element.type))
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
