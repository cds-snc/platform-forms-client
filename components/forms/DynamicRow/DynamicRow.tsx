import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useField } from "formik";
import { GenerateElement } from "../../../lib/formBuilder";
import { FormElement } from "../../../lib/types";
import { Button } from "../index";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

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
    return <GenerateElement key={subItem.id} element={subItem} language={lang} />;
  });
  return <div>{rowGroup}</div>;
};

export const DynamicGroup = (props: DynamicGroupProps): React.ReactElement => {
  const { className, legend, error, rowElements, lang } = props;
  const [field, meta, helpers] = useField(props);
  const [rows, setRows] = useState([rowElements]);
  const [initialValue, setInitialValues] = useState({});

  useEffect(() => {
    setInitialValues(field.value[0]);
  }, []);

  const addRow = async () => {
    field.value.push(initialValue);
    helpers.setValue(field.value);
    await setRows([...rows, rowElements]);
  };

  const classes = classnames("gc-form-group", { "gc-form-group--error": error }, className);

  return (
    <fieldset name={field.name} data-testid="formGroup" className={classes}>
      <legend>{legend}</legend>

      {meta.touched && meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}

      {rows.map((row, index) => {
        return (
          <div key={`${field.name}.${index}`} className="gc-item-row">
            <h3>
              {lang === "en" ? "Item " : "Article "}
              {index + 1}
            </h3>
            <DynamicRow elements={row} name={`${field.name}.${index}`} lang={lang} />
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
