import React, { ReactElement } from "react";
import {Input, TextArea} from "../components/forms";

interface FormElements {
  id: number,
  type: string,
  properties: ElementProperties,
  onchange?: Function,
}

interface ElementProperties {
  titleEn: string,
  titleFr: string,
  placeholderEn?: string,
  placeholderFr?: string,
  descriptionEn?: string,
  descriptionFr?: string,
  required: Boolean,
  choices?: Array<PropertyChoices>
  [key:string] : any
  
}

interface PropertyChoices {
    en: string,
    fr: string
}


// This function is used for the i18n change of form lables
function getProperty(field: string, lang: string) : string { 
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

// This function renders the form elements with passed in properties.
function buildForm(element : FormElements, value: any, lang: string, handleChange: Function): ReactElement {
  switch (element.type) {
    case "textField":
      return (
        <Input
          key={element.id}
          name={element.id.toString()}
          label={element.properties[getProperty("title", lang)]}
          value={value}
          onChange={() => handleChange}
          />
      )
    case "textArea":
      return (
        <TextArea
          key={element.id}
          name={element.id.toString()}
          label={element.properties[getProperty("title", lang)]}
          value={value}
          onChange={() => handleChange}
        />
      );
    default:
      return <></>
  }

}

module.exports = {
  getProperty,
  buildForm
}