"use client";
import React, { useState, useRef } from "react";
import { useField } from "formik";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { htmlInputAccept, ALLOWED_FILE_TYPES } from "@lib/validation/fileValidationClientSide";
import { CancelIcon } from "@serverComponents/icons";
import { themes } from "@clientComponents/globals/Buttons/themes";
import { Button } from "@clientComponents/globals/Buttons/Button";
import { BODY_SIZE_LIMIT_WITH_FILES } from "@root/constants";
import { bytesToMb } from "@lib/utils/fileSize";

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

// Heavily inspired by https://scottaohara.github.io/a11y_styled_form_controls/src/file-upload/

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const [field, meta, helpers] = useField(props);
  const { setValue, setError, setTouched } = helpers;

  const { name, disabled, allowMulti, required, ariaDescribedBy, lang } = props;

  const { t } = useTranslation("common", { lng: lang });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { value } = field;
  const [fileName, setFileName] = useState(value.name);
  const [fileSize, setFileSize] = useState(value.size);

  const resetInput = () => {
    setFileName("");
    setFileSize(0);
    setValue({});

    setError(undefined); // Clear the error
    setTouched(false); // Reset the touched state
  };
  const classes = cn(
    "gc-file-input",
    disabled ? "is-disabled" : "",
    allowMulti ? "file-up--compact" : ""
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
        // AWS WAF blocks files with random characters in their metadata
        // as such file uploads with images are blocked from being submitted
        // to the API. One of the recommended solutions is to base64 encode the image
        // on the client side before submitting to the API.
        // see https://aws.amazon.com/premiumsupport/knowledge-center/waf-upload-blocked-files/
        reader.readAsDataURL(newFile);
        // react dispatch functions will not work within reader callbacks
        // this we need to wait for reader readyState to be true
        reader.onloadend = () => {
          fileInputRef.current!.value = ""; // Reset the input value to allow re-uploading the same file

          if (newFile.name !== fileName) {
            setFileName(newFile.name);
            setFileSize(newFile.size);
            setValue({
              name: newFile.name,
              size: newFile.size,
              based64EncodedFile: reader.result?.toString().split(";base64,").pop(),
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

  return (
    <>
      {meta.error && <ErrorMessage id={`${name}_error`}>{meta.error}</ErrorMessage>}

      <div
        className={classes}
        data-testid="file"
        data-limit={bytesToMb(BODY_SIZE_LIMIT_WITH_FILES)}
      >
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
          aria-describedby={`${name}_file_selected ${ariaDescribedBy} ${
            meta.error ? `${name}_error` : null
          }`}
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
        <span id={`${name}_file_selected`} className="gc-file-input-file-selected">
          {fileName ? (
            <>
              <span className="sr-only">{`${t(
                "file-upload-sr-only-file-selected"
              )}: ${fileName}`}</span>
              <span aria-hidden={true}>
                {fileName} ({(fileSize / 1024 / 1024).toFixed(2)} {t("input-validation.MB")}){" "}
              </span>
              <Button theme="link" className="ml-3 [&_svg]:focus:fill-white" onClick={resetInput}>
                <div className="group ml-1 p-2 pr-3">
                  <CancelIcon className="inline-block" />
                  <span className="ml-1 inline-block group-hover:underline">{t("cancel")}</span>
                </div>
              </Button>
            </>
          ) : (
            t("file-upload-no-file-selected")
          )}
        </span>
      </div>
    </>
  );
};
