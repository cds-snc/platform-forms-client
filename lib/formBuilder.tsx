import React, { ChangeEvent, ReactElement } from "react";
import {
  Alert,
  Checkbox,
  Dropdown,
  Fieldset,
  Label,
  Radio,
  TextInput,
  TextArea,
  FormGroup,
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
  [key: string]: string | boolean | Array<PropertyChoices> | undefined;
}

interface PropertyChoices {
  en: string;
  fr: string;
}

// This function is used for the i18n change of form labels
function getProperty(field: string, lang: string): string {
  if (!field) {
    return lang;
  }
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

// This function is used for select/radio/checkbox i18n change of form labels
function getLocaleChoices(choices: Array<any> | undefined, lang: string) {
  if (!choices || !choices.length) {
    return [];
  }

  const localeChoices = choices.map((choice: any) => {
    return choice[lang];
  });

  return localeChoices;
}

// This function renders the form elements with passed in properties.
function buildForm(
  element: FormElements,
  value: string | boolean,
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
    onChange: (event: ChangeEvent) => handleChange(event),
  };

  const label = (
    <Label key={`label-${element.id}`} htmlFor={inputProps.name}>
      {inputProps.label}
    </Label>
  );

  switch (element.type) {
    case "alert":
      return (
        <Alert type="info" noIcon>
          {inputProps.description}
        </Alert>
      );
    case "textField":
      return (
        <>
          {label}
          <TextInput type="text" {...inputProps} />
        </>
      );
    case "textArea":
      return (
        <>
          {label}
          <TextArea {...inputProps} />
        </>
      );
    case "checkbox": {
      const checkboxItems = inputProps.choices.map((choice) => {
        return (
          <Checkbox
            {...inputProps}
            key={`key-${choice}`}
            id={`id-${choice}`}
            label={choice}
          />
        );
      });

      return (
        <FormGroup>
          {label}
          {checkboxItems}
        </FormGroup>
      );
    }
    case "radio": {
      const radioButtons = inputProps.choices.map((choice) => {
        return (
          <Radio
            {...inputProps}
            key={`key-${choice}`}
            id={`id-${choice}`}
            label={choice}
          />
        );
      });

      return (
        <FormGroup>
          {label}
          {radioButtons}
        </FormGroup>
      );
    }
    case "dropdown":
      return (
        <>
          {label}
          <Dropdown {...inputProps} />
        </>
      );
    case "plainText":
      return (
        <Fieldset {...inputProps}>
          {label}
          {inputProps.description}
        </Fieldset>
      );
    default:
      return <></>;
  }
}

module.exports = {
  getProperty,
  buildForm,
};
