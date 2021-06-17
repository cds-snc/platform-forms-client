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
    logMessage.error(err);
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
    element.properties && element.properties.subElements ? element.properties.subElements : [];

  const isRequired: boolean = element.properties.validation
    ? element.properties.validation.required
    : false;

  const labelText = element.properties[getProperty("title", lang)]?.toString();
  const labelComponent = labelText ? (
    <Label
      key={`label-${id}`}
      id={`label-${id}`}
      htmlFor={id}
      className={isRequired ? "required" : ""}
      required={isRequired}
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

  const placeHolder = element.properties[getProperty("placeholder", lang)] ?? "";

  const descriptionPerLocale = element.properties[getProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  switch (element.type) {
    case "textField":
      return (
        <div className="focus-group">
          {labelComponent}
          {description ? <Description id={id}>{description}</Description> : null}
          <TextInput
            type={textType}
            id={id}
            name={id}
            required={isRequired}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            placeholder={placeHolder.toString()}
          />
        </div>
      );
    case "textArea":
      return (
        <div className="focus-group">
          {labelComponent}
          {description ? <Description id={id}>{description}</Description> : null}
          <TextArea
            id={id}
            name={id}
            required={isRequired}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            placeholder={placeHolder.toString()}
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
        <FormGroup name={id} ariaDescribedBy={description ? `desc-${id}` : undefined}>
          <div className="focus-group">
            {labelComponent}
            {description ? <Description id={id}>{description}</Description> : null}
            <MultipleChoiceGroup
              type="checkbox"
              name={id}
              choicesProps={checkboxItems}
            ></MultipleChoiceGroup>
          </div>
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
        <FormGroup name={id} ariaDescribedBy={description ? `desc-${id}` : undefined}>
          <div className="focus-group">
            {labelComponent}
            {description ? <Description id={id}>{description}</Description> : null}
            <MultipleChoiceGroup
              type="radio"
              name={id}
              choicesProps={radioItems}
            ></MultipleChoiceGroup>
          </div>
        </FormGroup>
      );
    }
    case "dropdown":
      return (
        <div className="focus-group">
          {labelComponent}
          {description ? <Description id={id}>{description}</Description> : null}
          <Dropdown
            id={id}
            name={id}
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
        <Fragment>
          {labelComponent}
          {description ? <Description>{description}</Description> : null}
          <FileInput
            id={id}
            name={id}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            fileType={element.properties.fileType}
          />
        </Fragment>
      );
    case "dynamicRow": {
      return <DynamicGroup name={id} legend={labelText} rowElements={subElements} lang={lang} />;
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
    const element = formConfig.elements.find((element: FormElement) => element.id === item);
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
  } else if (element.properties.fileType) {
    // For file attachments, we need several values like the FileName, FileReader base64 object and File object
    return { file: null, src: null, name: "" };
  } else {
    // Regular inputs (not nested) like text, textarea have an empty value
    // Placeholder value is passed in using the appropriate html attribute
    return "";
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
    .map((element: FormElement) => {
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
