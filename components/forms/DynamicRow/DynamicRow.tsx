import React, { useState, useEffect, createRef, useRef } from "react";
import classnames from "classnames";
import { useField } from "formik";
import { GenerateElement } from "@lib/formBuilder";
import { FormElement } from "@lib/types";
import { Button, Description } from "@components/forms";
import { TFunction } from "next-i18next";
import { logMessage } from "@lib/logger";

interface DynamicGroupProps {
  name: string;
  title?: string;
  description?: string;
  rowLabel?: string;
  rowElements: Array<FormElement>;
  lang: string;
  t: TFunction;
  className?: string;
  error?: boolean;
  value?: string;
  maxNumberOfRows?: number;
}

interface DynamicRowProps {
  elements: Array<FormElement>;
  lang: string;
  name: string;
  t: TFunction;
}

const DynamicRow = (props: DynamicRowProps) => {
  const { name, elements, lang, t } = props;
  const rowGroup = elements.map((subItem, subIndex) => {
    subItem.subId = `${name}.${subIndex}`;
    return <GenerateElement key={subItem.subId} element={subItem} language={lang} t={t} />;
  });

  return <div>{rowGroup}</div>;
};

export const DynamicGroup = (props: DynamicGroupProps): React.ReactElement => {
  const {
    className,
    title,
    description,
    rowLabel = "Item",
    error,
    rowElements,
    lang,
    t,
    maxNumberOfRows,
  } = props;
  const [field, meta, helpers] = useField(props);
  const [rows, setRows] = useState(Array(field.value.length).fill(rowElements));
  const rowRefs = useRef<Array<React.RefObject<HTMLFieldSetElement>>>(
    Array(field.value.length).fill(createRef<HTMLFieldSetElement>())
  );
  const focussedRow = useRef<number | null>(null);
  const [hasReachedMaxNumberOfRows, setHasReachedMaxNumberOfRows] = useState<boolean>(false);

  useEffect(() => {
    if (focussedRow.current !== null) {
      rowRefs.current[focussedRow.current].current?.focus();
      rowRefs.current[focussedRow.current].current?.scrollIntoView();
      focussedRow.current = null;
    }

    // When rows are added or deleted run the useEffect again to focus on the new row
  }, [rows.length]);

  useEffect(() => {
    if (maxNumberOfRows) {
      setHasReachedMaxNumberOfRows(rows.length >= maxNumberOfRows);
    }
  }, [rows.length, maxNumberOfRows]);

  const addRow = () => {
    if (hasReachedMaxNumberOfRows) return;
    // Set the newly added row'initial value (plucked out of initialValues)
    const newValue = [...field.value];
    newValue.push(meta.initialValue ? meta.initialValue[0] : {});
    helpers.setValue(newValue);
    // Add the new row to the rows state
    setRows([...rows, rowElements]);
    // Add a new ref to the rowRefs state
    rowRefs.current.push(createRef<HTMLFieldSetElement>());
    // Do not subtract one because the rows state has not yet updated it's length when this is called
    focussedRow.current = rows.length;
  };

  const deleteRow = (index: number) => {
    // Remove the value from the formik state
    const newValues = [...field.value];
    newValues.splice(index, 1);
    helpers.setValue(newValues);
    // Remove the row from the rows state
    setRows((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      return newState;
    });
    // Remove ref from the rowRefs state
    rowRefs.current.splice(index, 1);
    focussedRow.current = index > 0 ? index - 1 : 0;
  };

  const classes = classnames("gc-form-group", { "gc-form-group--error": error }, className);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div id={field.name} data-testid={`formGroup-${field.name}`} className={classes} tabIndex={0}>
      {title && <div className="gc-label">{title}</div>}
      {description && <Description id={`${field.name}-desc`}>{description}</Description>}
      {rows.map((row, index) => {
        return (
          <fieldset
            key={`${field.name}.${index}`}
            id={`${field.name}.${index}`}
            className="gc-item-row"
            data-testid={`dynamic-row-${index + 1}`}
            ref={rowRefs.current[index]}
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
              t={t}
            />
            <div>
              {!hasReachedMaxNumberOfRows && index === rows.length - 1 && (
                <Button
                  type="button"
                  secondary={true}
                  onClick={addRow}
                  testid={`add-row-button-${field.name}`}
                >
                  {`${t("dynamicRow.add")} ${rowLabel}`}
                </Button>
              )}
              {rows.length > 1 && (
                <Button
                  type="button"
                  destructive={true}
                  onClick={() => deleteRow(index)}
                  testid={`delete-row-button-${field.name}.${index}`}
                >
                  {`${t("dynamicRow.delete")} ${rowLabel} ${index + 1}`}
                </Button>
              )}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
};
