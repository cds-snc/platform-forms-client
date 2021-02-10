import React, { ReactElement, Fragment } from "react";
import { logger, logMessage } from "./logger";
import {
  Alert,
  Checkbox,
  Dropdown,
  Label,
  Radio,
  TextInput,
  TextArea,
  FormGroup,
  FileInput,
  DynamicGroup,
  Description,
  Heading,
} from "../components/forms";
import { FormElement, PropertyChoices, FormMetadataProperties } from "./types";

// This function is used for the i18n change of form labels
export function getProperty(field: string, lang: string): string {
  try {
    if (!field) {
      return lang;
    }
    return field + lang.charAt(0).toUpperCase() + lang.slice(1);
  } catch (err) {
    logMessage.error(err);
    throw err;
  }
}

// This function is used for select/radio/checkbox i18n change of form labels
function getLocaleChoices(
  choices: Array<PropertyChoices> | undefined,
  lang: string
) {
  try {
    if (!choices || !choices.length) {
      return [];
    }

    const localeChoices = choices.map((choice) => {
      return choice[lang];
    });

    return localeChoices;
  } catch (err) {
    logMessage.error(err);
    throw err;
  }
}

// This function renders the form elements with passed in properties.
function _buildForm(element: FormElement, lang: string): ReactElement {
  const inputProps = {
    key: element.id,
    id: `id-${element.id}`,
    name: `id-${element.id}`,
    required: element.properties.required,
    label: element.properties[getProperty("title", lang)]?.toString(),
    choices:
      element.properties && element.properties.choices
        ? getLocaleChoices(element.properties.choices, lang)
        : [],
    description: element.properties[
      getProperty("description", lang)
    ]?.toString(),
  };

  const customProps = {
    headingLevel: element.properties.headingLevel
      ? element.properties.headingLevel
      : "h2",
    isSectional: element.properties.isSectional ? true : false,
    subElements:
      element.properties && element.properties.subElements
        ? element.properties.subElements
        : [],
  };

  const label = inputProps.label ? (
    <Label key={`label-${element.id}`} htmlFor={inputProps.name}>
      {inputProps.label}
    </Label>
  ) : null;

  const descriptiveText = inputProps.description ? (
    <Description id={`desc-${element.id}`}>
      {inputProps.description}
    </Description>
  ) : null;

  switch (element.type) {
    case "alert":
      return (
        <Alert type="info" noIcon>
          {descriptiveText}
        </Alert>
      );
    case "textField":
      return (
        <Fragment key={inputProps.id}>
          {label}
          {descriptiveText}
          <TextInput
            type="text"
            aria-describedby={
              inputProps.description ? `desc-${element.id}` : undefined
            }
            {...inputProps}
          />
        </Fragment>
      );
    case "textArea":
      return (
        <Fragment key={inputProps.id}>
          {label}
          {descriptiveText}
          <TextArea
            aria-describedby={
              inputProps.description ? `desc-${element.id}` : undefined
            }
            {...inputProps}
          />
        </Fragment>
      );
    case "checkbox": {
      const checkboxItems = inputProps.choices.map((choice, index) => {
        return (
          <Checkbox
            key={`key-${inputProps.id}-${index}`}
            id={`${inputProps.id}-${index}`}
            name={`${inputProps.id}-${index}`}
            label={choice}
            required={inputProps.required}
          />
        );
      });

      return (
        <FormGroup
          key={`formGroup-${inputProps.id}`}
          name={inputProps.name}
          aria-describedby={
            inputProps.description ? `desc-${element.id}` : undefined
          }
        >
          {label}
          {descriptiveText}
          {checkboxItems}
        </FormGroup>
      );
    }
    case "radio": {
      const radioButtons = inputProps.choices.map((choice, index) => {
        return (
          <Radio
            {...inputProps}
            key={`key-${inputProps.id}-${index}`}
            id={`${inputProps.id}-${index}`}
            label={choice}
          />
        );
      });

      return (
        <FormGroup
          key={`formGroup-${inputProps.id}`}
          name={inputProps.name}
          aria-describedby={
            inputProps.description ? `desc-${element.id}` : undefined
          }
        >
          {label}
          {descriptiveText}
          {radioButtons}
        </FormGroup>
      );
    }
    case "dropdown":
      return (
        <Fragment key={inputProps.id}>
          {label}
          {descriptiveText}
          <Dropdown
            aria-describedby={
              inputProps.description ? `desc-${element.id}` : undefined
            }
            {...inputProps}
          />
        </Fragment>
      );
    case "plainText":
      return (
        <div className="gc-plain-text" key={inputProps.id}>
          {inputProps.label ? (
            <h2 className="gc-h2">{inputProps.label}</h2>
          ) : null}
          {descriptiveText}
        </div>
      );
    case "heading":
      return (
        <Fragment key={inputProps.id}>
          {inputProps.label ? (
            <Heading
              {...inputProps}
              isSectional={customProps.isSectional}
              headingLevel={"h2"}
            >
              {inputProps.label}
            </Heading>
          ) : null}
        </Fragment>
      );
    case "fileInput":
      return (
        <Fragment key={inputProps.id}>
          {label}
          {descriptiveText}
          <FileInput
            aria-describedby={
              inputProps.description ? `desc-${element.id}` : undefined
            }
            {...inputProps}
            fileType={element.properties.fileType}
          />
        </Fragment>
      );
    case "dynamicRow": {
      return (
        <DynamicGroup
          key={`dynamicGroup-${inputProps.id}`}
          name={inputProps.name}
          legend={inputProps.label}
          rowElements={customProps.subElements}
          lang={lang}
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
 * @param formToRender
 * @param language
 */
const _getRenderedForm = (
  formMetadata: FormMetadataProperties,
  language: string
) => {
  if (!formMetadata) {
    return null;
  }

  return formMetadata.layout.map((item: string) => {
    const element = formMetadata.elements.find(
      (element: FormElement) => element.id === item
    );
    if (element) {
      return buildForm(element, language);
    } else {
      logMessage.error(
        `Failed component ID look up ${item} on form ID ${formMetadata.id}`
      );
    }
  });
};

/**
 * _getFormInitialValues calls this function to set the initial value for an element
 * @param formMetadata
 * @param language
 */

const _getElementInitialValue = (
  element: FormElement,
  language: string
): Record<string, unknown> | Record<string, unknown>[] | string => {
  const nestedObj: Record<string, unknown> = {};
  const currentId = `id-${element.id}`;

  // For "nested" inputs like radio, checkbox, dropdown, loop through the options to determine the nested value
  if (element.properties.choices) {
    element.properties.choices.map((choice, index) => {
      const choiceId = `${currentId}-${index}`;
      //initialValues[choiceId] = choice[language];
      nestedObj[choiceId] = choice[language];
    });

    return nestedObj;
  } else if (element.properties.subElements) {
    // For Dynamic Row reiterate through and create Initial Values to an Array of Objects
    const dynamicRow: Record<string, unknown> = {};
    element.properties.subElements.map((subElement, index) => {
      subElement.id = `${currentId}-${index}`;
      dynamicRow[subElement.id] = _getElementInitialValue(subElement, language);
    });
    return dynamicRow;
  } else {
    // Regular inputs (not nested) like text, textarea might have a placeholder value
    return (
      (element.properties[getProperty("placeholder", language)] as string) ?? ""
    );
  }
};

/**
 * DynamicForm calls this function to set the initial form values
 * getFormInitialValues
 * @param formMetadata
 * @param language
 */
const _getFormInitialValues = (
  formMetadata: FormMetadataProperties,
  language: string
) => {
  if (!formMetadata) {
    return null;
  }

  const initialValues: Record<string, unknown> = {};

  formMetadata.elements.map((element: FormElement) => {
    const currentId = `id-${element.id}`;

    initialValues[currentId] = _getElementInitialValue(element, language);
  });
  return initialValues;
};

export const buildForm = logger(_buildForm);
export const getFormInitialValues = logger(_getFormInitialValues);
export const getRenderedForm = logger(_getRenderedForm);
