import React, { useState, ChangeEvent, useRef } from "react";
import classnames from "classnames";
import { buildForm, FormElement, getProperty } from "../../../lib/formBuilder";
import { Button } from "../index";
type callback = (event: ChangeEvent) => void;

interface DynamicGroupProps {
  name: string;
  legend?: string;
  rowElements: Array<FormElement>;
  lang: string;
  className?: string;
  error?: boolean;
}

interface DynamicRowProps {
  elements: Array<FormElement>;
  lang: string;
  name: string;
  rowNum: number;
  values: [
    {
      id: string;
      value: string;
    }
  ];
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
    console.log(`Here is the subItem.id: ${subItem.id}`);
    const element = values.find((value) => value.id === subItem.id);
    console.log(element);
    console.log(`Component is re-rendering`);
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

  return buildForm(element, value, lang, onChange);
};
export const DynamicGroup = (props: DynamicGroupProps): React.ReactElement => {
  const { name, className, legend, error, rowElements, lang } = props;

  const [rows, setRows] = useState([rowElements]);

  const createRowState = (rowNum = 0) =>
    rowElements.map((element, index) => {
      element.id = `${name}-${rowNum}-${index}`;
      return {
        id: element.id,
        value: element.properties[getProperty("placeholder", lang)],
      };
    });

  const [responses, setResponses] = useState(createRowState);

  const updateLocalResponses = async (event) => {
    const { target } = event;
    console.log(`New Value for ${target.name}: ${target.value}`);

    const newState = responses.map((response) => {
      if (response.id === target.name) {
        return {
          id: target.name,
          value: target.value,
        };
      }
      return response;
    });

    await setResponses(newState);
  };

  const addRow = async () => {
    const baseClone = await createRowState(rows.length);
    const newState = [...responses, ...baseClone];
    await setResponses(newState);
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
            <DynamicRow
              name={name}
              elements={row}
              rowNum={index}
              lang={lang}
              values={responses}
              onChange={updateLocalResponses}
            />
          </div>
        );
      })}
    </fieldset>
  );
};

export default DynamicGroup;
