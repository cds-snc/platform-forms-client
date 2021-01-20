import React, { ChangeEvent, ReactElement, Fragment } from "react";
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
} from "../components/forms";
type callback = (event: ChangeEvent) => void;
interface FormElements {
  id: string;
  type: string;
  properties: ElementProperties;
  onchange?: callback;
}

interface ElementProperties {
  titleEn: string;
  titleFr: string;
  placeholderEn?: string;
  placeholderFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  required: boolean;
  choices?: Array<PropertyChoices>;
  fileType?: string | undefined;
  [key: string]: string | boolean | Array<PropertyChoices> | undefined;
}

interface PropertyChoices {
  en: string;
  fr: string;
  [key: string]: string;
}

// This function is used for the i18n change of form labels
function getProperty(field: string, lang: string): string {
  if (!field) {
    return lang;
  }
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

// This function is used for select/radio/checkbox i18n change of form labels
function getLocaleChoices(
  choices: Array<PropertyChoices> | undefined,
  lang: string
) {
  if (!choices || !choices.length) {
    return [];
  }

  const localeChoices = choices.map((choice) => {
    return choice[lang];
  });

  return localeChoices;
}

// This function renders the form elements with passed in properties.
function buildForm(
  element: FormElements,
  value: string,
  lang: string,
  handleChange: callback
): ReactElement {
  const inputProps = {
    key: element.id,
    id: element.id,
    name: element.id.toString(),
    label: element.properties[getProperty("title", lang)]?.toString(),
    value: value ? value.toString() : "",
    choices:
      element.properties && element.properties.choices
        ? getLocaleChoices(element.properties.choices, lang)
        : [],
    description: element.properties[
      getProperty("description", lang)
    ]?.toString(),
    onChange: handleChange,
  };

  const label = inputProps.label ? (
    <Label key={`label-${element.id}`} htmlFor={inputProps.name}>
      {inputProps.label}
    </Label>
  ) : null;

  const descriptiveText = inputProps.description ? (
    <p key={`desc-${element.id}`}>{inputProps.description}</p>
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
          <TextInput type="text" {...inputProps} />
        </Fragment>
      );
    case "textArea":
      return (
        <Fragment key={inputProps.id}>
          {label}
          {descriptiveText}
          <TextArea {...inputProps} />
        </Fragment>
      );
    case "checkbox": {
      const checkboxItems = inputProps.choices.map((choice, index) => {
        return (
          <Checkbox
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
        <FormGroup key={`formGroup-${inputProps.id}`} name={inputProps.name}>
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
          <Dropdown {...inputProps} />
        </Fragment>
      );
    case "plainText":
      return (
        <div className="gc-plain-text" key={`formGroup-${inputProps.id}`}>
          {inputProps.label ? <h2>inputProps.label</h2> : null}
          {descriptiveText}
        </div>
      );
    case "fileInput":
      return (
        <Fragment key={inputProps.id}>
          {label}
          {descriptiveText}
          <FileInput {...inputProps} fileType={element.properties.fileType} />
        </Fragment>
      );
    default:
      return <></>;
  }
}

module.exports = {
  getProperty,
  buildForm,
};
