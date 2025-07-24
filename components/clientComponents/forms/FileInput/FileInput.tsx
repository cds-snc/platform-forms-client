"use client";
import React, { useState, useRef } from "react";
import { useField } from "formik";

import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { htmlInputAccept, ALLOWED_FILE_TYPES } from "@lib/validation/fileValidationClientSide";
import { themes } from "@clientComponents/globals/Buttons/themes";
import { bytesToKbOrMbString } from "@lib/utils/fileSize";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { Priority } from "@clientComponents/globals/LiveRegion";

interface FileInputProps extends InputFieldProps {
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | string[] | undefined;
  allowMulti?: boolean;
}

export type FileEventTarget = React.ChangeEvent<HTMLInputElement> & {
  files: FileList;
  target: HTMLInputElement;
};

import { ResetButton } from "./ResetButton";

// Heavily inspired by https://scottaohara.github.io/a11y_styled_form_controls/src/file-upload/

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const [field, meta, helpers] = useField(props);
  const { setValue, setError, setTouched } = helpers;

  const { name, disabled, allowMulti, required, ariaDescribedBy, lang } = props;

  const { Event } = useCustomEvent();

  const { t } = useTranslation("common", { lng: lang });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { value } = field;

  const [fileName, setFileName] = useState(value?.name);
  const [fileSize, setFileSize] = useState<{
    size: number;
    unit: "bytes" | "KB" | "MB";
  }>(bytesToKbOrMbString(value?.size));

  const resetInput = () => {
    Event.fire(EventKeys.liveMessage, {
      message: t("fileInput.removedMessage", { fileName }),
      priority: Priority.LOW,
    });
    setFileName("");
    setFileSize({ size: 0, unit: "bytes" });
    setValue({});

    setError(undefined); // Clear the error
    setTouched(false); // Reset the touched state
  };

  const classes = cn(
    "gc-file-input",
    disabled ? "is-disabled" : "",
    allowMulti ? "file-up--compact" : "",
    props.className ? props.className : ""
  );

  const _onChange = (e: FileEventTarget) => {
    if (e.target?.files) {
      const reader = new FileReader();
      // Need to refactor in the future to add support for Multiple Files.
      // ex.. check for length of e.target.files[] and handle accordingly.
      // On multi file once files are selected remove `file-up--compact` and show
      // number of files uploaded or file list in file_output
      const newFile = e.target.files[0];
      if (newFile) {
        reader.readAsArrayBuffer(newFile);
        // react dispatch functions will not work within reader callbacks
        // this we need to wait for reader readyState to be true
        reader.onloadend = () => {
          fileInputRef.current!.value = ""; // Reset the input value to allow re-uploading the same file

          if (newFile.name !== fileName) {
            setFileName(newFile.name);

            Event.fire(EventKeys.liveMessage, {
              message: t("fileInput.addedMessage", { fileName: newFile.name }),
              priority: Priority.LOW,
            });

            setFileSize(bytesToKbOrMbString(newFile.size));
            setValue({
              name: newFile.name,
              size: newFile.size,
              content: reader.result as ArrayBuffer,
            });
          }
        };
      }
    }
  };

  // Ensure fileType is an array so we can map over it
  const itemFileTypes: string[] =
    typeof props.fileType === "string" ? [props.fileType] : props.fileType || [];

  let allowedFileTypes = "";

  // Map itemFileTypes to match ALLOWED_FILE_TYPES format and create a string for the accept attribute
  allowedFileTypes = itemFileTypes
    .map((type) => {
      const fileType = ALLOWED_FILE_TYPES.find((t) =>
        Array.isArray(t.extensions) ? t.extensions.includes(type) : t.extensions === type
      );
      return fileType
        ? [fileType.mime, ...fileType.extensions.map((ext: string) => `.${ext}`)].join(",")
        : "";
    })
    .filter(Boolean)
    .join(",");

  if (!allowedFileTypes) {
    // If no fileType is specified, use our default allowed file types
    allowedFileTypes = htmlInputAccept;
  }

  const describedBy = [
    `${name}_file_selected`,
    ariaDescribedBy,
    meta.error ? `${name}_error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {meta.error && <ErrorMessage id={`${name}_error`}>{meta.error}</ErrorMessage>}

      <div className={classes} data-testid="file">
        <div
          key={name}
          id={name}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
              e.preventDefault();
            }
          }}
          className={cn(themes.base, themes.secondary, "mr-4")}
          aria-disabled={disabled}
          aria-labelledby="file-input-button-text"
          aria-describedby={describedBy}
        >
          <span id="file-input-button-text" aria-hidden={true}>
            {t("file-upload-button-text")}
          </span>

          <input
            ref={fileInputRef}
            id={`${name}_hidden`}
            tabIndex={-1}
            type="file"
            accept={allowedFileTypes}
            onChange={_onChange}
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
            required={required}
            multiple={allowMulti}
            aria-hidden={true}
          />
        </div>
        <span id={`${name}_file_selected`} className="block">
          {fileName ? (
            <div className="my-4 max-w-fit border-2 border-gray-500 p-2">
              <span className="sr-only">{`${t(
                "file-upload-sr-only-file-selected"
              )}: ${fileName}`}</span>
              <span aria-hidden={true}>
                {fileName} ({fileSize.size} {t(`input-validation.${fileSize.unit}`)}){" "}
              </span>
              <ResetButton fileName={fileName} resetInput={resetInput} lang={lang} />
            </div>
          ) : (
            <span className="my-4 inline-block max-w-fit">{t("file-upload-no-file-selected")}</span>
          )}
        </span>
      </div>
    </>
  );
};
