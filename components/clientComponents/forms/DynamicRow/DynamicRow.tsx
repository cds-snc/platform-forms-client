"use client";
import React, { useState, useEffect, createRef, useRef } from "react";
import { cn } from "@lib/utils";
import { useField } from "formik";
import { GenerateElement } from "@lib/formBuilder";
import { FormElement } from "@lib/types";
import { Description } from "@clientComponents/forms";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

interface DynamicGroupProps {
  name: string;
  title?: string;
  description?: string;
  rowLabel?: string;
  addButtonText?: string;
  removeButtonText?: string;
  rowElements: Array<FormElement>;
  lang: string;

  className?: string;
  error?: boolean;
  value?: string;
  maxNumberOfRows?: number;
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
  const {
    className,
    title,
    description,
    rowLabel = "Item",
    error,
    rowElements,
    lang,
    addButtonText,
    removeButtonText,
    maxNumberOfRows,
  } = props;
  const [field, , helpers] = useField(props);
  const [rows, setRows] = useState(() => Array(field.value.length).fill(rowElements));
  const rowRefs = useRef<Array<React.RefObject<HTMLFieldSetElement | null>>>(
    Array(field.value.length).fill(createRef<HTMLFieldSetElement>())
  );
  const focusedRow = useRef<number | null>(null);
  const [hasReachedMaxNumberOfRows, setHasReachedMaxNumberOfRows] = useState<boolean>(false);
  const { Event } = useCustomEvent();

  const { t } = useTranslation();

  useEffect(() => {
    if (focusedRow.current !== null) {
      try {
        rowRefs.current[focusedRow.current].current?.querySelector("legend")?.focus();
        rowRefs.current[focusedRow.current].current?.scrollIntoView();
        focusedRow.current = null;
      } catch (e) {
        // no-op
      }
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
    newValue.push({}); // Push an empty object to the value array
    helpers.setValue(newValue);
    // Add the new row to the rows state
    setRows([...rows, rowElements]);
    // Add a new ref to the rowRefs state
    rowRefs.current.push(createRef<HTMLFieldSetElement>());
    // Do not subtract one because the rows state has not yet updated it's length when this is called
    focusedRow.current = rows.length;
    // Let an AT user know a new repeating set was added
    Event.fire(EventKeys.liveMessage, {
      message: t("dynamicRow.addedMessage", { rowTitle: title, count: rows.length + 1 }),
    });
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
    focusedRow.current = index > 0 ? index - 1 : 0;
    // Let an AT user know a new repeating set was removed
    Event.fire(EventKeys.liveMessage, {
      message: t("dynamicRow.removedMessage", {
        rowTitle: title,
        count: index > 0 ? index + 1 : 0,
      }),
    });
  };

  const classes = cn("gc-form-group", { "gc-form-group--error": error }, className);

  const addButtonLabel = addButtonText || t("dynamicRow.add") + " " + rowLabel;
  const deleteButtonLabel = removeButtonText || t("dynamicRow.delete") + " " + rowLabel;

  return (
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
          >
            <legend tabIndex={-1}>
              {rowLabel ? rowLabel : "Item"}
              {((maxNumberOfRows && maxNumberOfRows != 1) || !maxNumberOfRows) &&
                ` - ${index + 1} `}
            </legend>
            <DynamicRow
              key={`${field.name}.${index}`}
              elements={row}
              name={`${field.name}.${index}`}
              lang={lang}
            />
            <div className="mb-4">
              {!hasReachedMaxNumberOfRows && index === rows.length - 1 && (
                <Button
                  theme="secondary"
                  className="mr-4"
                  onClick={addRow}
                  dataTestId={`add-row-button-${field.name}`}
                >
                  {`${addButtonLabel}`}
                </Button>
              )}
              {rows.length > 1 && (
                <Button
                  theme="destructive"
                  onClick={() => deleteRow(index)}
                  dataTestId={`delete-row-button-${field.name}.${index}`}
                >
                  {`${deleteButtonLabel} ${index + 1}`}
                </Button>
              )}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
};
