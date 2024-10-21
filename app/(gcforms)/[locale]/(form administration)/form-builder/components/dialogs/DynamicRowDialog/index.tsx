"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button, Alert } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { CustomEventDetails, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

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

export type DynamicRowDialogEventDetails = {
  item: FormElementWithIndex;
};

export const DynamicRowDialog = () => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  const [item, setItem] = useState<FormElementWithIndex | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [error, setError] = useState<boolean | null>(null);

  const { updateField, setChangeKey } = useTemplateStore((s) => ({
    elements: s.form.elements,
    updateField: s.updateField,
    setChangeKey: s.setChangeKey,
  }));

  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
  };

  const forceRefresh = () => {
    setChangeKey(String(new Date().getTime())); //Force a re-render
  };

  const handleOpenDialog = useCallback((detail: CustomEventDetails) => {
    if (detail) {
      setItem(detail.item);
      setIsOpen(true);
    }
  }, []);

  const rowTitleTextA11yEn = t("dynamicRow.rowTitleTextA11yEn");
  const rowTitleTextA11yFr = t("dynamicRow.rowTitleTextA11yFr");

  const addButtonTextA11yEn = t("dynamicRow.addButtonTextA11yEn");
  const addButtonTextA11yFr = t("dynamicRow.addButtonTextA11yFr");

  const removeButtonTextA11yEn = t("dynamicRow.removeButtonTextA11yEn");
  const removeButtonTextA11yFr = t("dynamicRow.removeButtonTextA11yFr");

  useEffect(() => {
    Event.on("open-dynamic-row-dialog", handleOpenDialog);

    return () => {
      Event.off("open-dynamic-row-dialog", handleOpenDialog);
    };
  }, [Event, handleOpenDialog]);

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
          // @TODO: validation
          if (
            item?.properties.dynamicRow?.rowTitleEn === "" ||
            item?.properties.dynamicRow?.rowTitleFr === "" ||
            item?.properties.dynamicRow?.addButtonTextEn === "" ||
            item?.properties.dynamicRow?.addButtonTextFr === "" ||
            item?.properties.dynamicRow?.removeButtonTextEn === "" ||
            item?.properties.dynamicRow?.removeButtonTextFr === ""
          ) {
            setError(true);
            return;
          }

          if (!item || !item.properties) return;

          updateField(`form.elements[${item.index}].properties`, { ...item.properties });
          forceRefresh();
          handleClose();
        }}
        dataTestId="confirm-delete"
      >
        {t("dynamicRow.dialog.save")}
      </Button>
    </>
  );

  return (
    <>
      {isOpen && item && (
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
                  value={item.properties.dynamicRow?.rowTitleEn}
                  onChange={(e) => {
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        dynamicRow: {
                          ...item.properties.dynamicRow,
                          rowTitleEn: e.target.value || "",
                        },
                      },
                    });
                  }}
                />
              </TextInput>
              <TextInput label={t("dynamicRow.dialog.french")}>
                <input
                  aria-label={rowTitleTextA11yFr}
                  value={item.properties.dynamicRow?.rowTitleFr}
                  onChange={(e) => {
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        dynamicRow: {
                          ...item.properties.dynamicRow,
                          rowTitleFr: e.target.value || "",
                        },
                      },
                    });
                  }}
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
                  value={item.properties.dynamicRow?.addButtonTextEn}
                  onChange={(e) => {
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        dynamicRow: {
                          ...item.properties.dynamicRow,
                          addButtonTextEn: e.target.value || "",
                        },
                      },
                    });
                  }}
                />
              </TextInput>
              <TextInput label={t("dynamicRow.dialog.french")}>
                <input
                  aria-label={addButtonTextA11yFr}
                  value={item.properties.dynamicRow?.addButtonTextFr}
                  onChange={(e) => {
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        dynamicRow: {
                          ...item.properties.dynamicRow,
                          addButtonTextFr: e.target.value || "",
                        },
                      },
                    });
                  }}
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
                  value={item.properties.dynamicRow?.removeButtonTextEn}
                  onChange={(e) => {
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        dynamicRow: {
                          ...item.properties.dynamicRow,
                          removeButtonTextEn: e.target.value || "",
                        },
                      },
                    });
                  }}
                />
              </TextInput>
              <TextInput label={t("dynamicRow.dialog.french")}>
                <input
                  aria-label={removeButtonTextA11yFr}
                  value={item.properties.dynamicRow?.removeButtonTextFr}
                  onChange={(e) => {
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        dynamicRow: {
                          ...item.properties.dynamicRow,
                          removeButtonTextFr: e.target.value || "",
                        },
                      },
                    });
                  }}
                />
              </TextInput>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
