import React, { useState, useEffect, createRef } from "react";
import classnames from "classnames";
import { useField } from "formik";
import { GenerateElement } from "@lib/formBuilder";
import { FormElement } from "@lib/types";
import { Button } from "../index";
import { Description } from "../index";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface DynamicGroupProps {
  name: string;
  title?: string;
  description?: string;
  rowLabel?: string;
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
  const { className, title, description, rowLabel = "Item", error, rowElements, lang } = props;
  const [field, meta, helpers] = useField(props);
  const [rows, setRows] = useState([rowElements]);
  const [rowRefs, setRowRefs] = useState<Array<React.RefObject<HTMLFieldSetElement>>>([]);
  const [focussedRow, setFocussedRow] = useState<number | null>(null);

  useEffect(() => {
    //there are rows that were added to the form other than its initialvalues.
    if (field.value.length > 1) {
      //Refreshing rows from Formik's state
      setRows(Array(field.value.length).fill(rowElements));
    }
  }, []);

  useEffect(() => {
    // Fill state will refs for each existing row
    setRowRefs((rowRefs) =>
      Array(rows.length + 1)
        .fill(null)
        .map((_, index) => rowRefs[index] || createRef())
    );
    // Trigger on any change to the length of the rows state
  }, [rows.length]);

  useEffect(() => {
    if (focussedRow !== null) {
      rowRefs[focussedRow].current?.focus();
      rowRefs[focussedRow].current?.scrollIntoView();
    }
  }, [focussedRow]);

  const addRow = () => {
    // Set the newly added row'initial value (plucked out of initialValues)
    field.value.push(meta.initialValue ? meta.initialValue[0] : {});
    helpers.setValue(field.value);
    setRows([...rows, rowElements]);
    setFocussedRow(rows.length);
  };

  const deleteRow = (index: number) => {
    field.value.splice(index, 1);
    helpers.setValue(field.value);
    rows.splice(index, 1);
    setRows([...rows]);
    setFocussedRow(index > 0 ? index - 1 : 0);
  };

  const classes = classnames("gc-form-group", { "gc-form-group--error": error }, className);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div id={field.name} data-testid={`formGroup-${field.name}`} className={classes} tabIndex={0}>
      {title ? <div className="gc-label">{title}</div> : null}
      {description ? <Description id={`${field.name}-desc`}>{description}</Description> : null}
      {rows.map((row, index) => {
        return (
          <fieldset
            key={`${field.name}.${index}`}
            id={`${field.name}.${index}`}
            className="gc-item-row"
            data-testid={`dynamic-row-${index + 1}`}
            ref={rowRefs[index]}
            tabIndex={-1}
          >
            <legend>
              {rowLabel ? rowLabel : "Item"} - {index + 1}
            </legend>
            <DynamicRow
              key={`${field.name}.${index}`}
              elements={row}
              name={`${field.name}.${index}`}
              lang={lang}
            />
            {rows.length > 1 && (
              <Button
                type="button"
                secondary={true}
                onClick={() => deleteRow(index)}
                testid={`delete-row-button-${field.name}.${index}`}
              >
                {`${lang === "en" ? "Delete" : "Supprimer"} ${rowLabel} ${index + 1}`}
              </Button>
            )}
          </fieldset>
        );
      })}
      <Button
        type="button"
        secondary={true}
        onClick={addRow}
        testid={`add-row-button-${field.name}`}
      >
        {`${lang === "en" ? "Add" : "Ajouter"} ${rowLabel}`}
      </Button>
    </div>
  );
};

export default DynamicGroup;
