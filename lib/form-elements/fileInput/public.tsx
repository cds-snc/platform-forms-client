import React from "react";
import { FileInput as FileInputElement } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { type ClientElementDefinition } from "@lib/form-elements/clientHooks";

export const publicDefinition: ClientElementDefinition = {
  renderPublic: ({ element, lang }) => {
    const id = element.subId ?? element.id;
    const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();
    const description = element.properties[getLocalizedProperty("description", lang)]?.toString();
    const isRequired = Boolean(element.properties.validation?.required);

    return (
      <div className="focus-group">
        {labelText ? (
          <label className={`gcds-label${isRequired ? "required" : ""}`} htmlFor={`${id}`}>
            {labelText}
          </label>
        ) : null}
        {description ? <p id={`desc-${id}`}>{description}</p> : null}
        <FileInputElement
          id={`${id}`}
          name={`${id}`}
          ariaDescribedBy={description ? `desc-${id}` : labelText ? `label-${id}` : undefined}
          fileType={element.properties.fileType}
          required={isRequired}
          lang={lang}
        />
      </div>
    );
  },
};

export default publicDefinition;
