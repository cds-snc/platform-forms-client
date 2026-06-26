import { managedData } from "@lib/managedData";
import type { FormElement, PropertyChoices } from "@lib/types";

function getLocaleChoices(choices: Array<PropertyChoices> | undefined, lang: string): string[] {
  if (!choices) return [];
  return choices.map((choice) => choice[lang] ?? "");
}

/**
 * Resolves the full list of display choices for a form element,
 * merging managed-data choices when present.
 */
export function getElementChoices(element: FormElement, lang: string): string[] {
  const props = element.properties;

  let choices = getLocaleChoices(props.choices, lang);

  if (props.managedChoices) {
    if (Array.isArray(props.managedChoices)) {
      props.managedChoices.forEach((dataFile) => {
        const data = managedData[dataFile];
        const fileChoices = data ? getLocaleChoices(data, lang) : [];
        choices = choices.concat(fileChoices);
      });
      choices.sort((a, b) => a.localeCompare(b, lang));
    } else {
      const data = managedData[props.managedChoices];
      choices = data ? getLocaleChoices(data, lang) : [];
    }
  }

  return choices;
}
