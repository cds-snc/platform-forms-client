import React, { ReactElement } from "react";
import { logger, logMessage } from "@lib/logger";
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
} from "@components/forms";
import { GcdsInput } from "@cdssnc/gcds-components-react";
import {
  FormElement,
  FormElementTypes,
  PropertyChoices,
  PublicFormRecord,
  Responses,
  Response,
} from "@lib/types";
import { TFunction } from "next-i18next";

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

    return choices.map((choice) => {
      return choice[lang];
    });
  } catch (err) {
    logMessage.error(err as Error);
    throw err;
  }
}

// This function renders the form elements with passed in properties.
function _buildForm(element: FormElement, lang: string, t: TFunction): ReactElement {
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
      validation={element.properties.validation}
      group={["radio", "checkbox"].indexOf(element.type) !== -1}
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

  const placeHolderPerLocale = element.properties[getProperty("placeholder", lang)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  const descriptionPerLocale = element.properties[getProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  switch (element.type) {
    case FormElementTypes.textField:
      return (
        <GcdsInput
          inputId={`${id}`}
          label={`${labelText}`}
          hint={description}
          required={isRequired}
          size={element.properties.validation?.maxLength}
          // The following props have incompatible types
          // autocomplete={element.properties.autoComplete?.toString()}
          // type={textType}
          // placeholder={placeHolder.toString()}
        ></GcdsInput>
        // <div className="focus-group">
        //   {labelComponent}
        //   {description && <Description id={`${id}`}>{description}</Description>}
        //   <TextInput
        //     type={textType}
        //     id={`${id}`}
        //     name={`${id}`}
        //     required={isRequired}
        //     ariaDescribedBy={description ? `desc-${id}` : undefined}
        //     placeholder={placeHolder.toString()}
        //     autoComplete={element.properties.autoComplete?.toString()}
        //     maxLength={element.properties.validation?.maxLength}
        //     characterCountMessages={{
        //       part1: t("formElements.characterCount.part1"),
        //       part2: t("formElements.characterCount.part2"),
        //       part1Error: t("formElements.characterCount.part1-error"),
        //       part2Error: t("formElements.characterCount.part2-error"),
        //     }}
        //   />
        // </div>
      );
    case FormElementTypes.textArea:
      return (
        <div className="focus-group">
          {labelComponent}
          {description && <Description id={`${id}`}>{description}</Description>}
          <TextArea
            id={`${id}`}
            name={`${id}`}
            required={isRequired}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            placeholder={placeHolder.toString()}
            maxLength={element.properties.validation?.maxLength}
            characterCountMessages={{
              part1: t("formElements.characterCount.part1"),
              part2: t("formElements.characterCount.part2"),
              part1Error: t("formElements.characterCount.part1-error"),
              part2Error: t("formElements.characterCount.part2-error"),
            }}
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
            ariaDescribedBy={labelText ? labelText : undefined}
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
            ariaDescribedBy={labelText ? labelText : undefined}
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
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : undefined}
            choices={choices}
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
            >
              {labelText}
            </Label>
          )}
          {description && <Description id={`${id}`}>{description}</Description>}
          <FileInput
            id={`${id}`}
            name={`${id}`}
            ariaDescribedBy={description ? `desc-${id}` : `label-${id}`}
            fileType={element.properties.fileType}
            required={isRequired}
          />
        </div>
      );
    case FormElementTypes.dynamicRow: {
      return (
        <DynamicGroup
          name={`${id}`}
          title={labelText}
          description={description}
          rowLabel={placeHolder}
          rowElements={subElements}
          lang={lang}
          t={t}
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
const _getRenderedForm = (formRecord: PublicFormRecord, language: string, t: TFunction) => {
  return formRecord.form.layout
    .map((item: number) => {
      const element = formRecord.form.elements.find((element: FormElement) => element.id === item);
      if (element) {
        return <GenerateElement key={element.id} element={element} language={language} t={t} />;
      }
    })
    .filter((element): element is JSX.Element => typeof element !== "undefined");
};

/**
 * _getFormInitialValues calls this function to set the initial value for an element
 * @param element
 * @param language
 */
const _getElementInitialValue = (element: FormElement, language: string): Response => {
  switch (element.type) {
    // Radio and dropdown resolve to string values
    case FormElementTypes.radio:
    case FormElementTypes.dropdown:
    case FormElementTypes.textField:
    case FormElementTypes.textArea:
      return "";
    case FormElementTypes.checkbox:
      return [];
    case FormElementTypes.fileInput:
      return { file: null, src: null, name: "", size: 0 };
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
const _getFormInitialValues = (formRecord: PublicFormRecord, language: string): Responses => {
  if (!formRecord?.form) {
    return {};
  }

  const initialValues: Responses = {};

  formRecord.form.elements
    .filter((element) => ![FormElementTypes.richText].includes(element.type))
    .forEach((element: FormElement) => {
      initialValues[element.id] = _getElementInitialValue(element, language);
    });

  return initialValues;
};

type GenerateElementProps = {
  element: FormElement;
  language: string;
  t: TFunction;
};
export const GenerateElement = (props: GenerateElementProps): React.ReactElement => {
  const { element, language, t } = props;
  const generatedElement = _buildForm(element, language, t);
  return <>{generatedElement}</>;
};

export const getFormInitialValues = logger(_getFormInitialValues);
export const getRenderedForm = logger(_getRenderedForm);
