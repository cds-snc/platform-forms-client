"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button, Alert } from "@clientComponents/globals";
import { useDialogRef, Dialog } from "./Dialog";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const TextInput = ({ label, children }: { label: string; children: React.ReactElement }) => {
  return (
    <div className="mb-4 flex rounded-md border-1 border-black">
      <label className="block rounded-l-md border-r-1 border-black bg-slate-50 p-4 text-sm">
        {label}
      </label>
      {React.cloneElement(children, {
        className: "block w-full rounded-r-md p-2 outline-offset-[-5px]",
      })}
    </div>
  );
};

export const DynamicRowDialog = ({
  itemId,
  itemIndex,
  handleClose,
}: {
  itemId: number;
  itemIndex: number;
  handleClose: () => void;
}) => {
  const dialog = useDialogRef();
  const { t } = useTranslation("form-builder");

  const [error, setError] = useState<boolean | null>(null);

  const { updateField, elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
    updateField: s.updateField,
  }));

  const item = elements.find((el) => el.id === itemId);
  const rowProps = item?.properties?.dynamicRow;

  const [rowTitleValueEn, setRowTitleValueEn] = useState(rowProps?.rowTitleEn || "");
  const [rowTitleValueFr, setRowTitleValueFr] = useState(rowProps?.rowTitleFr || "");

  const [addButtonValueEn, setAddButtonValueEn] = useState(rowProps?.addButtonTextEn || "");

  const [addButtonValueFr, setAddButtonValueFr] = useState(rowProps?.addButtonTextFr || "");

  const [removeButtonValueEn, setRemoveButtonValueEn] = useState(
    rowProps?.removeButtonTextEn || ""
  );
  const [removeButtonValueFr, setRemoveButtonValueFr] = useState(
    rowProps?.removeButtonTextFr || ""
  );

  const rowTitleTextA11yEn = t("dynamicRow.rowTitleTextA11yEn");
  const rowTitleTextA11yFr = t("dynamicRow.rowTitleTextA11yFr");

  const addButtonTextA11yEn = t("dynamicRow.addButtonTextA11yEn");
  const addButtonTextA11yFr = t("dynamicRow.addButtonTextA11yFr");

  const removeButtonTextA11yEn = t("dynamicRow.removeButtonTextA11yEn");
  const removeButtonTextA11yFr = t("dynamicRow.removeButtonTextA11yFr");

  const actions = (
    <>
      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose && handleClose();
        }}
      >
        {t("dynamicRow.dialog.cancel")}
      </Button>
      <Button
        className="ml-5"
        theme="primary"
        onClick={() => {
          setError(null);
          if (
            rowTitleValueEn === "" ||
            rowTitleValueFr === "" ||
            addButtonValueEn === "" ||
            addButtonValueFr === "" ||
            removeButtonValueEn === "" ||
            removeButtonValueFr === ""
          ) {
            setError(true);
            return;
          }

          dialog.current?.close();

          if (!item || !item.properties) return;

          const properties = {
            ...item.properties,
            dynamicRow: {
              rowTitleEn: rowTitleValueEn,
              rowTitleFr: rowTitleValueFr,
              addButtonTextEn: addButtonValueEn,
              addButtonTextFr: addButtonValueFr,
              removeButtonTextEn: removeButtonValueEn,
              removeButtonTextFr: removeButtonValueFr,
            },
          };
          updateField(`form.elements[${itemIndex}].properties`, properties);
          handleClose && handleClose();
        }}
        dataTestId="confirm-delete"
      >
        {t("dynamicRow.dialog.save")}
      </Button>
    </>
  );

  return (
    <Dialog
      handleClose={handleClose}
      dialogRef={dialog}
      actions={actions}
      title={t("dynamicRow.dialog.title")}
    >
      <div className="p-5">
        {error && (
          <Alert.Danger className="mb-2" focussable>
            <Alert.Title headingTag="h3">{t("dynamicRow.dialog.error.title")}</Alert.Title>
            <p>{t("dynamicRow.dialog.error.message")}</p>
          </Alert.Danger>
        )}

        {/* Title input */}
        <div className="mb-8">
          <h4 className="mb-4 block font-bold">{t("dynamicRow.dialog.rowTitle.title")}</h4>
          <p className="mb-4 text-sm">{t("dynamicRow.dialog.rowTitle.description")}</p>
          <TextInput label={t("dynamicRow.dialog.english")}>
            <input
              aria-label={rowTitleTextA11yEn}
              value={rowTitleValueEn}
              onChange={(e) => setRowTitleValueEn(e.target.value)}
            />
          </TextInput>
          <TextInput label={t("dynamicRow.dialog.french")}>
            <input
              aria-label={rowTitleTextA11yFr}
              value={rowTitleValueFr}
              onChange={(e) => setRowTitleValueFr(e.target.value)}
            />
          </TextInput>
        </div>

        {/* Add button input */}
        <div className="mb-8">
          <h4 className="mb-4 block font-bold">{t("dynamicRow.dialog.addButton.title")}</h4>
          <p className="mb-4 text-sm">{t("dynamicRow.dialog.addButton.description")}</p>
          <TextInput label={t("dynamicRow.dialog.english")}>
            <input
              aria-label={addButtonTextA11yEn}
              value={addButtonValueEn}
              onChange={(e) => setAddButtonValueEn(e.target.value)}
            />
          </TextInput>
          <TextInput label={t("dynamicRow.dialog.french")}>
            <input
              aria-label={addButtonTextA11yFr}
              value={addButtonValueFr}
              onChange={(e) => setAddButtonValueFr(e.target.value)}
            />
          </TextInput>
        </div>

        {/* Remove button input */}
        <div>
          <label className="mb-4 block font-bold">
            {t("dynamicRow.dialog.removeButton.title")}
          </label>
          <p className="mb-4 text-sm">{t("dynamicRow.dialog.removeButton.description")}</p>
          <TextInput label={t("dynamicRow.dialog.english")}>
            <input
              aria-label={removeButtonTextA11yEn}
              value={removeButtonValueEn}
              onChange={(e) => setRemoveButtonValueEn(e.target.value)}
            />
          </TextInput>
          <TextInput label={t("dynamicRow.dialog.french")}>
            <input
              aria-label={removeButtonTextA11yFr}
              value={removeButtonValueFr}
              onChange={(e) => setRemoveButtonValueFr(e.target.value)}
            />
          </TextInput>
        </div>
      </div>
    </Dialog>
  );
};
