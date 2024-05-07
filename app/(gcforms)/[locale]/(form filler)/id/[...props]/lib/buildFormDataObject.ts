import {
  FileInputResponse,
  PublicFormRecord,
  Response,
  Responses,
  FormElement,
  FormElementTypes,
} from "@lib/types";

/**
 * Put any Client related global helper/utils here. The rest of /lib is for anything server related.
 */

export function buildFormDataObject(formRecord: PublicFormRecord, values: Responses) {
  const formData = {} as { [key: string]: string | FileInputResponse };

  const formElementsWithoutRichTextComponents = formRecord.form.elements.filter(
    (element) => ![FormElementTypes.richText].includes(element.type)
  );

  for (const element of formElementsWithoutRichTextComponents) {
    const result = _handleDynamicRowTypeIfNeeded(element, values[element.id]);
    for (const tuple of result) {
      formData[tuple[0]] = tuple[1];
    }
  }

  formData["formID"] = `${formRecord.id}`;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return formData;
}

function _handleDynamicRowTypeIfNeeded(
  element: FormElement,
  value: Response
): [string, string | FileInputResponse][] {
  if (element.type === FormElementTypes.dynamicRow) {
    if (element.properties.subElements === undefined) return [];

    const responses = value as Responses[];
    const subElements = element.properties.subElements;

    /**
     * We are creating a new data structure (to be passed to the submit API) from the multiple responses that could have been entered
     * for the dynamic row component we are currently processing. */
    return (
      responses
        .map((response, responseIndex) => {
          return subElements
            .map((subElement, subElementIndex) => {
              const result = _handleFormDataType(subElement, response[subElementIndex]);
              /**
               * We are wrapping the result in an array so that if the response is undefined we can return an empty array that will then
               * disappear once we call the `flat` function at the end.
               */
              return result
                ? ([[`${element.id}-${responseIndex}-${subElementIndex}`, result[1]]] as [
                    string,
                    string | FileInputResponse
                  ][])
                : [];
            })
            .flat();
        })
        // `flat` function is needed because we use a `map` in a `map`.
        .flat()
    );
  } else {
    const result = _handleFormDataType(element, value);
    return result ? [result] : [];
  }
}

function _handleFormDataType(
  element: FormElement,
  value: Response
): [string, string | FileInputResponse] | undefined {
  switch (element.type) {
    case FormElementTypes.textField:
    case FormElementTypes.textArea:
      // string
      return _handleFormDataText(element.id.toString(), value as string);
    case FormElementTypes.dropdown:
    case FormElementTypes.combobox:
    case FormElementTypes.radio:
    case FormElementTypes.review:
      return value instanceof Object
        ? _handleFormDataText(element.id.toString(), "")
        : _handleFormDataText(element.id.toString(), value as string);
    case FormElementTypes.checkbox:
      // array of strings
      return Array.isArray(value)
        ? _handleFormDataArray(element.id.toString(), value as Array<string>)
        : _handleFormDataText(element.id.toString(), "");
    case FormElementTypes.fileInput:
      return _handleFormDataFileInput(element.id.toString(), value as FileInputResponse);
    case FormElementTypes.richText:
      return undefined;
  }
}

function _handleFormDataFileInput(
  key: string,
  value: FileInputResponse
): [string, FileInputResponse | string] {
  return value.based64EncodedFile
    ? [key, { name: value.name, size: value.size, based64EncodedFile: value.based64EncodedFile }]
    : _handleFormDataText(key, "");
}

function _handleFormDataText(key: string, value: string): [string, string] {
  return [key, value];
}

function _handleFormDataArray(key: string, value: Array<string>): [string, string] {
  return [key, JSON.stringify({ value: value })];
}
