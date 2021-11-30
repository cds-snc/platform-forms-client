import React, { useState, useRef } from "react";
import { useField } from "formik";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { ErrorMessage } from "../index";

export const acceptedFileMimeTypes =
  "application/pdf,.csv,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.apple.numbers";

interface FileInputProps {
  id: string;
  name: string;
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  disabled?: boolean;
  required?: boolean;
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

  const { name, disabled, allowMulti, required, ariaDescribedBy, ariaLabelledBy } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { value } = field;
  const [fileName, setFileName] = useState(value.name);

  const classes = classNames(
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
        reader.onloadend = () => setFileName(newFile.name);
        if (newFile.name !== fileName) {
          reader.readAsDataURL(newFile);
          setValue({ file: newFile, src: reader, name: newFile.name, size: newFile.size });
        }
      }
    }
  };

  return (
    <>
      {meta.error ? <ErrorMessage id={`${name}_error`}>{meta.error}</ErrorMessage> : null}

      <div className={classes} data-testid="file">
        <div
          id={name}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          className="gc-file-input-upload-button"
          aria-disabled={disabled}
          aria-labelledby={`${ariaLabelledBy}`}
          aria-describedby={`${name}_file_selected ${ariaDescribedBy} ${
            meta.error ? `${name}_error` : null
          }`}
        >
          <span aria-hidden={true}>{t("file-upload-button-text")}</span>

          <input
            ref={fileInputRef}
            id={`${name}_hidden`}
            tabIndex={-1}
            type="file"
            accept={acceptedFileMimeTypes}
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
              <span aria-hidden={true}>{fileName}</span>
            </>
          ) : (
            t("file-upload-no-file-selected")
          )}
        </span>
      </div>
    </>
  );
};

export default FileInput;
