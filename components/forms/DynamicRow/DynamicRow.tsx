import React, { useState } from "react";
import classnames from "classnames";
import {
  buildForm,
  FormElement,
  getProperty,
  callback,
  allFormElements,
} from "../../../lib/formBuilder";
import { Button } from "../index";
import { useField } from "formik";

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
  rowNum: number;
  values: {
    id: string;
    value: string;
  }[];
  onChange: callback;
}

interface DynamicElementProps {
  element: FormElement;
  value: string;
  lang: string;
  onChange: callback;
}
const DynamicRow = (props: DynamicRowProps) => {
  const { name, elements, rowNum, values, lang, onChange } = props;
  const rowGroup = elements.map((subItem, subIndex) => {
    subItem.id = `${name}-${rowNum}-${subIndex}`;
    const element = values.find((value) => value.id === subItem.id) ?? {
      id: subItem.id,
      value: "",
    };
    return (
      <DynamicElement
        key={subItem.id}
        element={subItem}
        value={element.value}
        lang={lang}
        onChange={onChange}
      />
    );
  });
  return <div>{rowGroup}</div>;
};

const DynamicElement = (props: DynamicElementProps): React.ReactElement => {
  const { element, value, lang, onChange } = props;

  return buildForm(element, lang, onChange);
};
export const DynamicGroup = (props: DynamicGroupProps): React.ReactElement => {
  const { name, className, legend, error, rowElements, lang } = props;

  const [rows, setRows] = useState([rowElements]);

  const createRowState = (rowNum = 0): { id: string; value: string }[] =>
    rowElements.map((element, index) => {
      element.id = `${name}-${rowNum}-${index}`;
      return {
        id: element.id,
        value: element.properties[getProperty("placeholder", lang)] as string,
      };
    });

  const [responses, setResponses] = useState(createRowState);

  const updateLocalResponses = async (event: allFormElements) => {
    const { target } = event;
    await setResponses((prevState) => {
      const newState = prevState.map((response) => {
        if (response.id === target.name) {
          return {
            id: target.name,
            value: target.value,
          };
        }
        return response;
      });
      return newState;
    });
  };

  const addRow = async () => {
    const baseClone = await createRowState(rows.length);

    await setResponses((prevState) => {
      return [...prevState, ...baseClone];
    });
    await setRows([...rows, rowElements]);
  };

  const classes = classnames(
    "gc-form-group",
    { "gc-form-group--error": error },
    className
  );

  return (
    <fieldset name={name} data-testid="formGroup" className={classes}>
      <legend>{legend}</legend>
      {rows.map((row, index) => {
        return (
          <div key={`${name}-${index}`} className="gc-item-row">
            <p>
              {lang === "en" ? "Item" : "Article"}
              {index + 1}
            </p>
            <DynamicRow
              key={name}
              name={name}
              elements={row}
              rowNum={index}
              lang={lang}
              values={
                responses.length > 0 ? responses : [{ id: "", value: "" }]
              }
              onChange={updateLocalResponses}
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
