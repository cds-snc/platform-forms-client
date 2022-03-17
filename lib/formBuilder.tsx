import React, { ReactElement, Fragment } from "react";
import { logger, logMessage } from "./logger";
import {
  Dropdown,
  Label,
  TextInput,
  TextArea,
  FormGroup,
  FileInput,
  DynamicGroup,
  Description,
  RichText,
  MultipleChoiceGroup,
} from "../components/forms";
import { FormElement, PropertyChoices, PublicFormSchemaProperties } from "./types";

// This function is used for the i18n change of form labels
export function getProperty(field: string, lang: string): string {
  try {
    if (!field) {
      return lang;
    }
    return field + lang.charAt(0).toUpperCase() + lang.slice(1);
  } catch (err) {
    logMessage.error(err as Error);
    throw err;
  }
}

// This function is used for select/radio/checkbox i18n change of form labels
function getLocaleChoices(choices: Array<PropertyChoices> | undefined, lang: string) {
  try {
    if (!choices || !choices.length) {
      return [];
    }

    const localeChoices = choices.map((choice) => {
      return choice[lang];
    });

    return localeChoices;
  } catch (err) {
    logMessage.error(err as Error);
    throw err;
  }
}

// This function renders the form elements with passed in properties.
function _buildForm(element: FormElement, lang: string): ReactElement {
  const id = element.subId ?? element.id;

  const choices =
    element.properties && element.properties.choices
      ? getLocaleChoices(element.properties.choices, lang)
      : [];

  const subElements =
    element.properties && element.properties.subElements ? element.properties.subElements : [];

  const isRequired: boolean = element.properties.validation
    ? element.properties.validation.required
    : false;

  const labelText = element.properties[getProperty("title", lang)]?.toString();
  const labelComponent = labelText ? (
    <Label
      key={`label-${id}`}
      id={`label-${id}`}
      htmlFor={`${id}`}
      className={isRequired ? "required" : ""}
      required={isRequired}
      group={["radio", "checkbox"].indexOf(element.type) !== -1}
    >
      {labelText}
    </Label>
  ) : null;

  // get text field types in order to be more specific in <input> definition, and allow for browser autofill (best practice)
  function getTextType(element: FormElement): string {
    if (element.properties && element.properties.validation && element.properties.validation.type) {
      switch (element.properties.validation.type) {
        case "email":
          return "email";
        case "phone":
          return "tel";
        case "name":
          return "name";
      }
    }
    return "text";
  }
  const textType = getTextType(element) as
    | "text"
    | "email"
    | "name"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "url";

  const placeHolderPerLocale = element.properties[getProperty("placeholder", lang)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  const descriptionPerLocale = element.properties[getProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  switch (element.type) {
    case "textField":
      return (
        <div className="focus-group">
          {labelComponent}
          {description ? <Description id={`${id}`}>{description}</Description> : null}
          <TextInput
            type={textType}
            id={`${id}`}
            name={`${id}`}
            required={isRequired}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            placeholder={placeHolder.toString()}
            autoComplete={element.properties.autoComplete?.toString()}
          />
        </div>
      );
    case "textArea":
      return (
        <div className="focus-group">
          {labelComponent}
          {description ? <Description id={`${id}`}>{description}</Description> : null}
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
    case "checkbox": {
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
          {description ? <Description id={`${id}`}>{description}</Description> : null}
          <MultipleChoiceGroup
            type="checkbox"
            name={`${id}`}
            choicesProps={checkboxItems}
            ariaDescribedBy={labelText ? labelText : undefined}
          ></MultipleChoiceGroup>
        </FormGroup>
      );
    }
    case "radio": {
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
          {description ? <Description id={`${id}`}>{description}</Description> : null}
          <MultipleChoiceGroup
            type="radio"
            name={`${id}`}
            choicesProps={radioItems}
            ariaDescribedBy={labelText ? labelText : undefined}
          ></MultipleChoiceGroup>
        </FormGroup>
      );
    }
    case "dropdown":
      return (
        <div className="focus-group">
          {labelComponent}
          {description ? <Description id={`${id}`}>{description}</Description> : null}
          <Dropdown
            id={`${id}`}
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            choices={choices}
          />
        </div>
      );
    case "richText":
      return (
        <>
          {labelText ? <h3 className="gc-h3">{labelText}</h3> : null}
          <RichText>{description}</RichText>
        </>
      );
    case "fileInput":
      return (
        <div className="focus-group">
          {labelText ? (
            <Label
              key={`label-${id}`}
              id={`label-${id}`}
              className={isRequired ? "required" : ""}
              required={isRequired}
            >
              {labelText}
            </Label>
          ) : null}
          {description ? <Description id={`${id}`}>{description}</Description> : null}
          <FileInput
            id={`${id}`}
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : `label-${id}`}
            fileType={element.properties.fileType}
            required={isRequired}
          />
        </div>
      );
    case "dynamicRow": {
      return (
        <DynamicGroup
          name={`${id}`}
          title={labelText}
          description={description}
          rowLabel={placeHolder}
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
const _getRenderedForm = (formConfig: PublicFormSchemaProperties, language: string) => {
  if (!formConfig) {
    return null;
  }

  return formConfig.layout.map((item: string) => {
    const element = formConfig.elements.find(
      (element: FormElement) => element.id === parseInt(item)
    );
    if (element) {
      return <GenerateElement key={element.id} element={element} language={language} />;
    } else {
      logMessage.error(`Failed component ID look up ${item} on form ID ${formConfig.formID}`);
    }
  });
};

/**
 * _getFormInitialValues calls this function to set the initial value for an element
 * @param formConfig
 * @param language
 */

const _getElementInitialValue = (
  element: FormElement,
  language: string
): Record<string, unknown> | Record<string, unknown>[] | string | undefined => {
  switch (element.type) {
    case "textField":
    case "textArea":
      return "";
    case "checkbox":
    case "radio":
    case "dropdown":
      return undefined;
    case "fileInput":
      return { file: null, src: null, name: "", size: 0 };
    case "dynamicRow": {
      const dynamicRowInitialValue: Record<string, unknown> =
        element.properties.subElements?.reduce((accumulator, currentValue, currentIndex) => {
          const subElementID = `${currentIndex}`;
          if (!["richText"].includes(currentValue.type)) {
            accumulator[subElementID] = _getElementInitialValue(currentValue, language);
          }
          return accumulator;
        }, {} as Record<string, unknown>) ?? {};
      return [dynamicRowInitialValue];
    }
    default:
      throw `Initial value for component ${element.type} is not handled`;
  }
};

/**
 * DynamicForm calls this function to set the initial form values
 * getFormInitialValues
 * @param formConfig
 * @param language
 */
const _getFormInitialValues = (formConfig: PublicFormSchemaProperties, language: string) => {
  if (!formConfig) {
    return null;
  }

  const initialValues: Record<string, unknown> = {};

  formConfig.elements
    .filter((element) => !["richText"].includes(element.type))
    .forEach((element: FormElement) => {
      initialValues[element.id] = _getElementInitialValue(element, language);
    });

  return initialValues;
};

type GenerateElementProps = {
  element: FormElement;
  language: string;
};
export const GenerateElement = (props: GenerateElementProps): React.ReactElement => {
  const { element, language } = props;
  const generatedElement = _buildForm(element, language);
  return <>{generatedElement}</>;
};

export const getFormInitialValues = logger(_getFormInitialValues);
export const getRenderedForm = logger(_getRenderedForm);
