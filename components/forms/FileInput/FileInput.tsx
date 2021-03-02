import React, { useState } from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

interface FileInputProps {
  id: string;
  name: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
}

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const [file, setFile] = useState<ArrayBuffer | string | null>();
  const { id, className, fileType } = props;

  const classes = classnames("gc-file-input", className);
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  return (
    <>
      {meta.touched && meta.error ? (
        <ErrorMessage>{meta.error}</ErrorMessage>
      ) : null}
      <input
        type="file"
        data-testid="file"
        data-attachment={file}
        className={classes}
        id={id}
        accept={fileType}
        {...field}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.files) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function () {
              const fileObject = reader.result;
              setFile(fileObject);
            };
          }
        }}
      />
    </>
  );
};

export default FileInput;
