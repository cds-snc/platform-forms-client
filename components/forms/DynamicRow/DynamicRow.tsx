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
    subItem.subId = `${name}.${subIndex}`;
    return <GenerateElement key={subItem.subId} element={subItem} language={lang} />;
  });
  return <div>{rowGroup}</div>;
};

export const DynamicGroup = (props: DynamicGroupProps): React.ReactElement => {
  const { className, legend, error, rowElements, lang } = props;
  const [field, meta, helpers] = useField(props);
  const [rows, setRows] = useState([rowElements]);

  useEffect(() => {
    //there are rows that were added to the form other than its initialvalues.
    if (field.value.length > 1) {
      //Refreshing rows from Formik's state
      setRows(Array(field.value.length).fill(rowElements));
    }
  }, []);

  const addRow = () => {
    // Set the newly added row'initial value (plucked out of initialValues)
    field.value.push(meta.initialValue ? meta.initialValue[0] : {});
    helpers.setValue(field.value);
    setRows([...rows, rowElements]);
  };

  const deleteRow = (index: number) => {
    field.value.splice(index, 1);
    helpers.setValue(field.value);
    rows.splice(index, 1);
    setRows([...rows]);
  };

  const classes = classnames("gc-form-group", { "gc-form-group--error": error }, className);

  return (
    <fieldset name={field.name} data-testid={`formGroup-${field.name}`} className={classes}>
      <legend>{legend}</legend>

      {rows.map((row, index) => {
        return (
          <div
            key={`${field.name}.${index}`}
            className="gc-item-row"
            data-testid={`dynamic-row-${index + 1}`}
          >
            <DynamicRow elements={row} name={`${field.name}.${index}`} lang={lang} />
            {rows.length > 1 && (
              <Button
                type="button"
                secondary={true}
                onClick={() => deleteRow(index)}
                testid={`delete-row-button-${field.name}.${index}`}
              >
                {lang === "en" ? "Delete Row" : "Supprimer Element"}
              </Button>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        secondary={true}
        onClick={addRow}
        testid={`add-row-button-${field.name}`}
      >
        {lang === "en" ? "Add Row" : "Ajouter Element"}
      </Button>
    </fieldset>
  );
};

export default DynamicGroup;
