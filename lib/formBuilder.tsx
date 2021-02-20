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
  const id = element.id;

  const choices =
    element.properties && element.properties.choices
      ? getLocaleChoices(element.properties.choices, lang)
      : [];

  const subElements =
    element.properties && element.properties.subElements
      ? element.properties.subElements
      : [];

  const labelText = element.properties[getProperty("title", lang)]?.toString();
  const labelComponent = labelText ? (
    <Label key={`label-${id}`} htmlFor={id}>
      {labelText}
    </Label>
  ) : null;

  const description = element.properties[
    getProperty("description", lang)
  ]?.toString();
  const descriptiveText = description ? (
    <p className="gc-p" id={`desc-${id}`}>
      {description}
    </p>
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
        <Fragment>
          {labelComponent}
          <Description>{description}</Description>
          <TextInput
            type="text"
            id={id}
            name={id}
            required={element.properties.required}
            aria-describedby={description ? `desc-${id}` : undefined}
          />
        </Fragment>
      );
    case "textArea":
      return (
        <Fragment>
          {labelComponent}
          <Description>{description}</Description>
          <TextArea
            id={id}
            name={id}
            required={element.properties.required}
            aria-describedby={description ? `desc-${id}` : undefined}
          />
        </Fragment>
      );
    case "checkbox": {
      const checkboxItems = choices.map((choice, index) => {
        return (
          <Checkbox
            key={`${id}.${index}`}
            id={`${id}.${index}`}
            name={`${id}`}
            label={choice}
            required={element.properties.required}
          />
        );
      });

      return (
        <FormGroup
          name={id}
          aria-describedby={description ? `desc-${id}` : undefined}
        >
          {labelComponent}
          <Description>{description}</Description>
          {checkboxItems}
        </FormGroup>
      );
    }
    case "radio": {
      const radioButtons = choices.map((choice, index) => {
        return (
          <Radio
            key={`${id}.${index}`}
            id={`${id}.${index}`}
            name={`${id}`}
            label={choice}
            required={element.properties.required}
          />
        );
      });

      return (
        <FormGroup
          name={id}
          aria-describedby={description ? `desc-${id}` : undefined}
        >
          {labelComponent}
          <Description>{description}</Description>
          {radioButtons}
        </FormGroup>
      );
    }
    case "dropdown":
      return (
        <Fragment>
          {labelComponent}
          <Description>{description}</Description>
          <Dropdown
            id={id}
            name={id}
            aria-describedby={description ? `desc-${id}` : undefined}
            choices={choices}
          />
        </Fragment>
      );
    case "plainText":
      return (
        <div className="gc-plain-text">
          {labelText ? <h2 className="gc-h3">{labelText}</h2> : null}

          {descriptiveText}
        </div>
      );
    case "heading":
      return (
        <Fragment>
          {labelText ? (
            <Heading
              isSectional={element.properties.isSectional ? true : false}
              headingLevel={"h2"}
            >
              {labelText}
            </Heading>
          ) : null}
        </Fragment>
      );
    case "fileInput":
      return (
        <Fragment>
          {labelComponent}
          <Description>{description}</Description>
          <FileInput
            id={id}
            name={id}
            aria-describedby={description ? `desc-${id}` : undefined}
            fileType={element.properties.fileType}
          />
        </Fragment>
      );
    case "dynamicRow": {
      return (
        <DynamicGroup
          name={id}
          legend={labelText}
          rowElements={subElements}
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
      return (
        <GenerateElement
          key={element.id}
          element={element}
          language={language}
        />
      );
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

  // For "nested" inputs like radio, checkbox, dropdown, loop through the options to determine the nested value
  if (element.properties.choices) {
    element.properties.choices.map((choice, index) => {
      //initialValues[choiceId] = choice[language];
      nestedObj[index] = choice[language];
    });

    return nestedObj;
  } else if (element.properties.subElements) {
    // For Dynamic Row reiterate through and create Initial Values to an Array of Objects
    const dynamicRow: Record<string, unknown> = {};
    element.properties.subElements.map((subElement, index) => {
      const subElementID = `${index}`;
      dynamicRow[subElementID] = _getElementInitialValue(subElement, language);
    });
    return [dynamicRow];
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
    initialValues[element.id] = _getElementInitialValue(element, language);
  });

  return initialValues;
};

type GenerateElementProps = {
  element: FormElement;
  language: string;
};
export const GenerateElement = (
  props: GenerateElementProps
): React.ReactElement => {
  const { element, language } = props;
  const generatedElement = _buildForm(element, language);
  return <>{generatedElement}</>;
};

export const getFormInitialValues = logger(_getFormInitialValues);
export const getRenderedForm = logger(_getRenderedForm);
