import React, { ReactElement } from "react";
import { Input, TextArea } from "../components/forms";
type callback = (event: Event) => void;
interface FormElements {
  id: number;
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

// This function is used for the i18n change of form lables
function getProperty(field: string, lang: string): string {
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

// This function renders the form elements with passed in properties.
function buildForm(
  element: FormElements,
  value: string | boolean,
  lang: string,
  handleChange: callback
): ReactElement {
  switch (element.type) {
    case "textField":
      return (
        <Input
          key={element.id}
          name={element.id.toString()}
          label={element.properties[getProperty("title", lang)]?.toString()}
          value={value ? value.toString() : ""}
          onChange={(event) => handleChange(event)}
        />
      );
    case "textArea":
      return (
        <TextArea
          key={element.id}
          name={element.id.toString()}
          label={element.properties[getProperty("title", lang)]?.toString()}
          value={value ? value.toString() : ""}
          onChange={(event) => handleChange(event)}
        />
      );
    default:
      return <></>;
  }
}

module.exports = {
  getProperty,
  buildForm,
};
