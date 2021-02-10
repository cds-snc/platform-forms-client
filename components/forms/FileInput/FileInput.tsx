import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface FileInputProps {
  id: string;
  name: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
}
const getFileObject = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) {
    return;
  }
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);

  reader.onload = function () {
    console.log("FILE UPLOAD ONLOAD", reader.result);
  };
};

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const { id, className, fileType } = props;

  const classes = classnames("gc-file-input", className);
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  return (
    <>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
      <input
        type="file"
        data-testid="file"
        className={classes}
        id={id}
        accept={fileType}
        {...field}
        onChange={(e) => {
          setValue(e.target.value);
          getFileObject(e);
        }}
      />
    </>
  );
};

export default FileInput;
