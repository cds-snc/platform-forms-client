import React, { useState, useEffect } from "react";
import { useField, Field } from "formik";
import { ErrorMessage } from "../index";

interface FileInputProps {
  id: string;
  name: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
  ariaDescribedBy?: string;
}
export type FileEventTarget = EventTarget & {
  files: FileList;
  target: HTMLInputElement;
};

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  const { value } = field;
  const [fileName, setFileName] = useState(value.name);
  const [file, setFile] = useState(value.file);
  const [src, setSrc] = useState(value.src);

  const _onChange = (e: FileEventTarget) => {
    if (!e.target || !e.target.files) {
      return;
    }
    const reader = new FileReader();
    const newFile = e.target.files[0];
    if (newFile) {
      reader.onloadend = () => setFileName(newFile.name);
      if (newFile.name !== fileName) {
        reader.readAsDataURL(newFile);
        setSrc(reader);
        setFile(newFile);
      }
    }
  };

  useEffect(() => {
    setValue({ file: file, src: src, name: fileName });
  }, [file, src, fileName]);

  return (
    <>
      {meta.touched && meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <Field component={UploadField} onChange={_onChange} />
    </>
  );
};

/**
 * The input type="file" cannot be updated programatically, only via a user interaction
 * Therefore, the HOC Field wraps this UploadField component.
 * Formik will receive the updated values via the onChange function that is in the props
 */
const UploadField = ({ ...props }) => {
  return (
    <>
      <Field
        className="gc-file-input"
        name="uploader"
        type={"file"}
        data-testid="file"
        {...props}
      />
    </>
  );
};

export default FileInput;
