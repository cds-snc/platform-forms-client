"use client";
import React, { useState, useRef } from "react";
import { useField } from "formik";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { ErrorMessage } from "@clientComponents/forms";
import { InputFieldProps } from "@lib/types";
import { htmlInputAccept } from "@lib/validation/fileValidationClientSide";
import { CancelIcon } from "@serverComponents/icons";
import { themes } from "@clientComponents/globals/Buttons/themes";

interface FileInputProps extends InputFieldProps {
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
  allowMulti?: boolean;
}
export type FileEventTarget = React.ChangeEvent<HTMLInputElement> & {
  files: FileList;
  target: HTMLInputElement;
};

// Heavily inspired by https://scottaohara.github.io/a11y_styled_form_controls/src/file-upload/

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  const { t } = useTranslation("common");

  const { name, disabled, allowMulti, required, ariaDescribedBy } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { value } = field;
  const [fileName, setFileName] = useState(value.name);
  const [fileSize, setFileSize] = useState(value.size);

  const resetInput = () => {
    setFileName("");
    setFileSize(0);
    setValue({});
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

  return (
    <>
      {meta.error && <ErrorMessage id={`${name}_error`}>{meta.error}</ErrorMessage>}

      <div className={classes} data-testid="file">
        <div
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
            accept={htmlInputAccept}
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
                <span className="ml-3 cursor-pointer" onClick={() => resetInput()}>
                  <CancelIcon className="inline-block" /> {t("cancel")}
                </span>
              </span>
            </>
          ) : (
            t("file-upload-no-file-selected")
          )}
        </span>
      </div>
    </>
  );
};
