import React, { useState, useEffect } from "react";
import { useField, Field } from "formik";

interface FileInputProps {
  id: string;
  name: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
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
    const file = e.target.files[0];
    if (file) {
      reader.onloadend = () => setFileName(file.name);
      if (file.name !== fileName) {
        reader.readAsDataURL(file);
        setSrc(reader);
        setFile(file);
      }
    }
  };

  useEffect(() => {
    if (file && fileName && src) {
      setValue({ file: file, src: src, name: fileName });
    }
  }, [src, fileName, file]);

  return (
    <>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
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
