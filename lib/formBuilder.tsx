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
  const id = `id-${element.id}`;
  const name = id;
  const key = element.id;

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
        <Fragment key={key}>
          {labelComponent}
          <Description>{description}</Description>
          <TextInput
            type="text"
            key={`key-${id}`}
            id={id}
            name={name}
            required={element.properties.required}
            aria-describedby={description ? `desc-${id}` : undefined}
          />
        </Fragment>
      );
    case "textArea":
      return (
        <Fragment key={key}>
          {labelComponent}
          <Description>{description}</Description>
          <TextArea
            key={`key-${id}`}
            id={id}
            name={name}
            required={element.properties.required}
            aria-describedby={description ? `desc-${id}` : undefined}
          />
        </Fragment>
      );
    case "checkbox": {
      const checkboxItems = choices.map((choice, index) => {
        return (
          <Checkbox
            key={`key-${id}-${index}`}
            id={`${id}-${index}`}
            name={`${id}-${index}`}
            label={choice}
            required={element.properties.required}
          />
        );
      });

      return (
        <FormGroup
          key={`formGroup-${id}`}
          name={name}
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
            key={`key-${id}-${index}`}
            id={`${id}-${index}`}
            name={name}
            label={choice}
            required={element.properties.required}
          />
        );
      });

      return (
        <FormGroup
          key={`formGroup-${id}`}
          name={name}
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
        <Fragment key={key}>
          {labelComponent}
          <Description>{description}</Description>
          <Dropdown
            id={id}
            name={name}
            aria-describedby={description ? `desc-${id}` : undefined}
            choices={choices}
          />
        </Fragment>
      );
    case "plainText":
      return (
        <div className="gc-plain-text" key={key}>
          {labelText ? <h2 className="gc-h2">{labelText}</h2> : null}
          {descriptiveText}
        </div>
      );
    case "heading":
      return (
        <Fragment key={key}>
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
        <Fragment key={key}>
          {labelComponent}
          <Description>{description}</Description>
          <FileInput
            id={id}
            name={name}
            aria-describedby={description ? `desc-${id}` : undefined}
            fileType={element.properties.fileType}
          />
        </Fragment>
      );
    case "dynamicRow": {
      return (
        <DynamicGroup
          key={`dynamicGroup-${id}`}
          name={name}
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
      return buildForm(element, language);
    } else {
      logMessage.error(
        `Failed component ID look up ${item} on form ID ${formMetadata.id}`
      );
    }
  });
};

/**
 * DynamicForm calls this function to set the initial form values
 * getFormInitialValues
 * @param formMetadata
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

    if (element.properties.choices) {
      // For "nested" inputs like radio, dropdown, loop through the options to determine the nested value
      const nestedObj: Record<string, unknown> = {};

      element.properties.choices.map((choice, index) => {
        const choiceId = `${currentId}-${index}`;
        nestedObj[choiceId] = choice[language];
      });
      initialValues[currentId] = nestedObj;
    } else {
      // Regular inputs (not nested) like text, textarea might have a placeholder value
      initialValues[currentId] =
        element.properties[getProperty("placeholder", language)] ?? "";
    }
  });

  return initialValues;
};

export const buildForm = logger(_buildForm);
export const getFormInitialValues = logger(_getFormInitialValues);
export const getRenderedForm = logger(_getRenderedForm);
