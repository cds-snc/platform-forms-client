import React, { useState, ChangeEvent, useEffect } from "react";
import classnames from "classnames";
import { buildForm, FormElement } from "../../../lib/formBuilder";
import { Button } from "../index";
type callback = (event: ChangeEvent) => void;

interface DynamicGroupProps {
  name: string;
  legend?: string;
  rowElements: Array<FormElement>;
  lang: string;
  className?: string;
  error?: boolean;
  value: any;
  onChange?: callback;
}

export const DynamicRow = (props: DynamicGroupProps): React.ReactElement => {
  const { name, className, legend, error, rowElements, lang } = props;
  const baseRow = rowElements;
  const [rows, setRows] = useState([baseRow]);

  const addRow = () => {
    setRows([...rows, baseRow]);
  };

  const classes = classnames(
    "gc-form-group",
    { "gc-form-group--error": error },
    className
  );

  return (
    <fieldset name={name} data-testid="formGroup" className={classes}>
      <legend>{legend}</legend>
      <Button type="button" secondary={true} onClick={addRow}>
        {lang === "en" ? "Add Row" : "Ajouter Element"}
      </Button>
      {rows.map((row, index) => {
        return (
          <div
            key={`${name}-${index}`}
            className="border-solid border-2 border-black"
          >
            <p>
              {lang === "en" ? "Item" : "Article"}
              {index + 1}
            </p>
            {row.map((subItem, subIndex) => {
              subItem.id = `${name}-${index}-${subIndex}`;
              return buildForm(
                (subItem as unknown) as FormElement,
                "",
                lang,
                () => null
              );
            })}
          </div>
        );
      })}
    </fieldset>
  );
};

export default DynamicRow;
