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
  if(!field) {
    return lang;
  }
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

// This function is used for select/radio/checbox i18n change of form lables
function getLocaleChoices(choices: Array<any>, lang: string) {
  let localeChoices: Array<any> = [];
  if (!choices || !choices.length) {
    return localeChoices;
  }
  choices.forEach((choice: any) => {    
    localeChoices.push(choice[getProperty("", lang)]);
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
    onChange: (event) => handleChange(event),
  };

  const choices =
    element && element.properties ? element.properties.choices : [];

  const label = (
    <Label key={`label-${element.id}`} htmlFor={inputProps.name}>
      {inputProps.label}
    </Label>
  );

  switch (element.type) {
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
    case "checkbox":
      return <Checkbox {...inputProps} />;
    case "radio":
      return <Radio {...inputProps} />;
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
