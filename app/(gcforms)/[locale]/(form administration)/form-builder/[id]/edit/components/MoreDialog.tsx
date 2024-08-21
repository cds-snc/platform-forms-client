import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";
import { Close } from "@serverComponents/icons/Close";
import { useTranslation } from "@i18n/client";
import {
  Checkbox,
  Dialog,
  InfoDetails,
  Input,
  Radio,
  TextArea,
  useDialogRef,
} from "@formBuilder/components/shared";
import { useEffect, useState } from "react";
import { ModalForm } from "./ModalForm";
import { FormElementWithIndex, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElementTypes } from "@lib/types";
import { AutocompleteDropdown } from "./AutocompleteDropdown";

const ModalLabel = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className="mb-2 block font-[700]">
    {children}
  </label>
);

const Hint = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className="mb-5 leading-snug">
    {children}
  </p>
);

export const MoreDialog = ({ className }: { className?: string }) => {
  const { t } = useTranslation("form-builder");

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const dialogRef = useDialogRef();
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<FormElementWithIndex | undefined>(undefined);

  const handleClose = () => {
    setIsOpen(false);
  };

  function isCustomEvent(event: Event): event is CustomEvent {
    return "detail" in event;
  }

  useEffect(() => {
    window &&
      window.addEventListener("open-more-dialog", (e: Event) => {
        if (isCustomEvent(e)) {
          setItem(e.detail.item);
          setIsOpen(true);
        }
      });
  }, []);

  const autocompleteSelectedValue = (item && item.properties.autoComplete) || "";
  const checked = item && item.properties.validation?.required;

  return (
    <>
      {isOpen && (
        <Dialog
          title={t("downloadResponsesModals.downloadDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
        >
          <div className="p-8">
            {item && (
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
                <section>
                  <div className="mb-2">
                    <ModalLabel htmlFor={`titleEn--modal--${item.index}`}>
                      {t("question")}
                    </ModalLabel>
                    <Input
                      id={`title--modal--${item.index}`}
                      name={`item${item.index}`}
                      placeholder={t("question")}
                      value={
                        item.properties[
                          localizeField(
                            LocalizedElementProperties.TITLE,
                            translationLanguagePriority
                          )
                        ]
                      }
                      className="w-11/12"
                      // onChange={(e) =>
                      //   updateModalProperties(item.id, {
                      //     ...properties,
                      //     ...{
                      //       [localizeField(
                      //         LocalizedElementProperties.TITLE,
                      //         translationLanguagePriority
                      //       )]: e.target.value,
                      //     },
                      //   })
                      // }
                    />
                  </div>
                  <div className="mb-2">
                    <ModalLabel>{t("inputDescription")}</ModalLabel>
                    <Hint>{t("descriptionDescription")}</Hint>
                    <TextArea
                      id={`description--modal--${item.index}`}
                      placeholder={t("inputDescription")}
                      testId="description-input"
                      className="w-11/12"
                      onChange={(e) => {
                        const description = e.target.value.replace(/[\r\n]/gm, "");
                        // updateModalProperties(item.id, {
                        //   ...properties,
                        //   ...{
                        //     [localizeField(
                        //       LocalizedElementProperties.DESCRIPTION,
                        //       translationLanguagePriority
                        //     )]: description,
                        //   },
                        // });
                      }}
                      value={
                        item.properties[
                          localizeField(
                            LocalizedElementProperties.DESCRIPTION,
                            translationLanguagePriority
                          )
                        ]
                      }
                    />
                  </div>
                </section>
                {item.type === FormElementTypes.formattedDate && (
                  <section className="mb-4">
                    <h3>Date options</h3>
                    <p className="mt-4 font-semibold">What type of date is collected?</p>

                    <Radio
                      className="mt-2"
                      name="autoComplete"
                      id="autoComplete-general"
                      label="General date"
                      value=""
                      checked={!item.properties.autoComplete}
                      // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      //   updateModalProperties(item.id, {
                      //     ...properties,
                      //     ...{ autoComplete: e.target.value },
                      //   });
                      // }}
                    />
                    <Radio
                      className="mt-2"
                      name="autoComplete"
                      id="autoComplete-bday"
                      label="Birthdate"
                      value="bday"
                      checked={item.properties.autoComplete === "bday"}
                      // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      //   updateModalProperties(item.id, {
                      //     ...properties,
                      //     ...{ autoComplete: e.target.value },
                      //   });
                      // }}
                    />

                    <p className="mt-4 font-semibold">Select a format for the date</p>
                    <Radio
                      className="mt-2"
                      name="dateFormat"
                      id="dateFormat-iso"
                      label="YYYY-MM-DD (Government of Canada standard)"
                      value="YYYY-MM-DD"
                      checked={item.properties.dateFormat === "YYYY-MM-DD"}
                      // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      //   updateModalProperties(item.id, {
                      //     ...properties,
                      //     ...{ dateFormat: e.target.value },
                      //   });
                      // }}
                    />
                    <Radio
                      className="mt-2"
                      name="dateFormat"
                      id="dateFormat-ddmmyyyy"
                      label="DD-MM-YYYY"
                      value="DD-MM-YYYY"
                      checked={item.properties.dateFormat === "DD-MM-YYYY"}
                      // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      //   updateModalProperties(item.id, {
                      //     ...properties,
                      //     ...{ dateFormat: e.target.value },
                      //   });
                      // }}
                    />
                    <Radio
                      className="mt-2"
                      name="dateFormat"
                      id="dateFormat-mmddyyyy"
                      label="MM-DD-YYYY"
                      value="MM-DD-YYYY"
                      checked={item.properties.dateFormat === "MM-DD-YYYY"}
                      // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      //   updateModalProperties(item.id, {
                      //     ...properties,
                      //     ...{ dateFormat: e.target.value },
                      //   });
                      // }}
                    />

                    <InfoDetails summary="Which date format should you use?" className="my-4">
                      <div className="ml-2 border-l-2 border-gray-500 pl-4">
                        <p className="my-4">
                          Canada’s date standard format is YYYY-MM-DD and should be your first
                          choice unless there is a reason to choose a different format.
                        </p>
                        <p className="my-4">
                          For example, when asking for a date exactly as it’s shown on a passport,
                          card or other document, make the fields match the format of the original.
                          This makes it easier for users to copy the date across accurately.
                        </p>
                      </div>
                    </InfoDetails>
                  </section>
                )}
                <section className="mb-4">
                  <div className="mb-2">
                    <h3>{t("addRules")}</h3>
                  </div>
                  <div>
                    <Checkbox
                      id={`required-${item.index}-id-modal`}
                      value={`required-${item.index}-value-modal-` + checked}
                      key={`required-${item.index}-modal-` + checked}
                      defaultChecked={checked}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // clone the existing properties so that we don't overwrite other keys in "validation"
                        const validation = Object.assign({}, item.properties.validation, {
                          required: e.target.checked,
                        });
                        // updateModalProperties(item.id, {
                        //   ...properties,
                        //   ...{ validation },
                        // });
                      }}
                      label={t("required")}
                    ></Checkbox>
                  </div>
                </section>
                {item.type === FormElementTypes.dynamicRow && (
                  <section className="mb-4">
                    <ModalLabel htmlFor={`maxNumberOfRows--modal--${item.index}`}>
                      {t("maxNumberOfRows.label")}
                    </ModalLabel>
                    <Hint>{t("maxNumberOfRows.description")}</Hint>
                    <Input
                      id={`maxNumberOfRows--modal--${item.index}`}
                      type="number"
                      min="1"
                      className="w-1/4"
                      value={item.properties.maxNumberOfRows || ""}
                      onKeyDown={(e) => {
                        if (["-", "+", ".", "e"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // if value is "", unset the field
                        // if (e.target.value === "") {
                        //   unsetModalField(`modals[${item.id}].properties.maxNumberOfRows`);
                        //   return;
                        // }
                        // const value = parseInt(e.target.value);
                        // if (!isNaN(value) && value >= 1) {
                        //   updateModalProperties(item.id, {
                        //     ...properties,
                        //     maxNumberOfRows: value,
                        //   });
                        // }
                      }}
                    />
                  </section>
                )}

                {item.type === FormElementTypes.textField && (
                  <section className="mb-4 mt-8">
                    <ModalLabel htmlFor="">{t("selectAutocomplete")}</ModalLabel>
                    <Hint>{t("selectAutocompleteHint")}</Hint>
                    <div>
                      <AutocompleteDropdown
                        handleChange={(e) => {
                          const autoComplete = e.target.value;
                          // updateModalProperties(item.id, {
                          //   ...properties,
                          //   ...{ autoComplete },
                          // });
                        }}
                        selectedValue={autocompleteSelectedValue as string}
                      />{" "}
                      <InfoDetails summary={t("autocompleteWhenNotToUse.title")}>
                        <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
                          <p className="mb-4 text-sm">{t("autocompleteWhenNotToUse.text1")}</p>
                          <p className="text-sm">{t("autocompleteWhenNotToUse.text2")}</p>
                        </div>
                      </InfoDetails>
                    </div>
                  </section>
                )}
                {item.type === FormElementTypes.textField ||
                  (item.type === FormElementTypes.textArea &&
                    (!item.properties.validation?.type ||
                      item.properties.validation?.type === "text") && (
                      <section className="mb-4">
                        <div className="mb-2">
                          <ModalLabel htmlFor={`characterLength--modal--${item.index}`}>
                            {t("maximumCharacterLength")}
                          </ModalLabel>
                          <Hint>{t("characterLimitDescription")}</Hint>
                          <Input
                            id={`characterLength--modal--${item.index}`}
                            type="number"
                            min="1"
                            className="w-1/4"
                            value={item.properties.validation?.maxLength || ""}
                            onKeyDown={(e) => {
                              if (["-", "+", ".", "e"].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              // if value is "", unset the field
                              // if (e.target.value === "") {
                              //   unsetModalField(`modals[${item.id}].validation.maxLength`);
                              //   return;
                              // }
                              // const value = parseInt(e.target.value);
                              // if (!isNaN(value) && value >= 1) {
                              //   // clone the existing properties so that we don't overwrite other keys in "validation"
                              //   const validation = Object.assign({}, properties.validation, {
                              //     maxLength: value,
                              //   });
                              //   updateModalProperties(item.id, {
                              //     ...properties,
                              //     ...{ validation },
                              //   });
                              // }
                            }}
                          />
                        </div>
                        <InfoDetails summary={t("characterLimitWhenToUse.title")}>
                          <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
                            <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text1")}</p>
                            <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text2")}</p>
                            <p className="text-sm">{t("characterLimitWhenToUse.text3")}</p>
                          </div>
                        </InfoDetails>
                      </section>
                    ))}
              </form>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};
