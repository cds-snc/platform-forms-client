import React, { useState } from "react";
import classnames from "classnames";
import { useField } from "formik";
import { GenerateElement } from "../../../lib/formBuilder";
import { FormElement, allFormElements, callback } from "../../../lib/types";
import { Button } from "../index";

interface DynamicGroupProps {
  name: string;
  legend?: string;
  rowElements: Array<FormElement>;
  lang: string;
  className?: string;
  error?: boolean;
  value?: string;
}

interface DynamicRowProps {
  elements: Array<FormElement>;
  lang: string;
  name: string;
}

const DynamicRow = (props: DynamicRowProps) => {
  const { name, elements, lang } = props;
  const rowGroup = elements.map((subItem, subIndex) => {
    subItem.id = `${name}.${subIndex}`;
    return (
      <GenerateElement key={subItem.id} element={subItem} language={lang} />
    );
  });
  return <div>{rowGroup}</div>;
};

export const DynamicGroup = (props: DynamicGroupProps): React.ReactElement => {
  const { className, legend, error, rowElements, lang } = props;
  const [field, meta, helpers] = useField(props);
  const initialValues = field.value;
  const [rows, setRows] = useState([rowElements]);

  const addRow = async () => {
    field.value.push(initialValues);
    helpers.setValue(field.value);
    await setRows([...rows, rowElements]);
  };

  const classes = classnames(
    "gc-form-group",
    { "gc-form-group--error": error },
    className
  );

  return (
    <fieldset name={field.name} data-testid="formGroup" className={classes}>
      <legend>{legend}</legend>
      {rows.map((row, index) => {
        return (
          <div key={`${field.name}.${index}`} className="gc-item-row">
            {" "}
            <h2>
              {lang === "en" ? "Item " : "Article "}
              {index + 1}
            </h2>
            <DynamicRow
              elements={row}
              name={`${field.name}.${index}`}
              lang={lang}
            />
          </div>
        );
      })}
      <Button type="button" secondary={true} onClick={addRow}>
        {lang === "en" ? "Add Row" : "Ajouter Element"}
      </Button>
    </fieldset>
  );
};

export default DynamicGroup;
