import React, { ChangeEvent, ReactElement, Fragment } from "react";
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
export type allFormElements =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>;
export type callback = (event: allFormElements) => void;
export interface FormElement {
  id: string;
  type: string;
  properties: ElementProperties;
  onchange?: callback;
}

export interface ElementProperties {
  titleEn: string;
  titleFr: string;
  placeholderEn?: string;
  placeholderFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  required: boolean;
  choices?: Array<PropertyChoices>;
  subElements?: Array<FormElement>;
  fileType?: string | undefined;
  headingLevel?: string | undefined;
  isSectional?: boolean;
  [key: string]:
    | string
    | boolean
    | Array<PropertyChoices>
    | Array<FormElement>
    | undefined;
}

export interface PropertyChoices {
  en: string;
  fr: string;
  [key: string]: string;
}

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
function _buildForm(
  element: FormElement,
  lang: string,
  handleChange: callback
): ReactElement {
  const inputProps = {
    key: element.id,
    id: `id-${element.id}`,
    name: `name-${element.id}`,
    required: element.properties.required,
    label: element.properties[getProperty("title", lang)]?.toString(),
    choices:
      element.properties && element.properties.choices
        ? getLocaleChoices(element.properties.choices, lang)
        : [],
    description: element.properties[
      getProperty("description", lang)
    ]?.toString(),
    onChange: handleChange,
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
            {...inputProps}
            key={`key-${inputProps.id}-${index}`}
            id={`id-${inputProps.id}-${index}`}
            name={`name-${inputProps.id}-${index}`}
            label={choice}
            value={choice}
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
            id={`id-${inputProps.id}-${index}`}
            label={choice}
            value={choice}
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
const _getRenderedForm = (formToRender, language: string) => {
  if (!formToRender) {
    return null;
  }

  return formToRender.layout.map((item: string) => {
    const element = formToRender.elements.find(
      (element: FormElement) => element.id === item
    );
    if (element) {
      return buildForm(element, language, (e) => {});
    } else {
      logMessage.error(
        `Failed component ID look up ${item} on form ID ${formToRender.id}`
      );
    }
  });
};

/**
 * DynamicForm calls this function to set the initial form values
 * getFormInitialValues
 * @param formMetadata
 */
const _getFormInitialValues = (formMetadata) => {
  if (!formMetadata) {
    return null;
  }

  let initialValues = {};

  logger(
    formMetadata.elements.map((element) => {
      initialValues[`name-${element.id}`] = element.properties.choices
        ? false
        : "";

      // if (element.properties.choices) {
      //   let nestedObj = {};
      //   element.properties.choices.map((choice, index) => {
      //     const choiceId = `id-${index}`;
      //     nestedObj[choiceId] = {
      //       name: `name-${element.id}`,
      //       value: choice[i18n.language],
      //     };
      //   });
      //}
    })
  );
  return initialValues;
};

export const buildForm = logger(_buildForm);
export const getFormInitialValues = logger(_getFormInitialValues);
export const getRenderedForm = logger(_getRenderedForm);
