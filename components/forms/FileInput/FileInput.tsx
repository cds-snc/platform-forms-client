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
  //const [file, setFile] = useState<ArrayBuffer | string | null>();
  const { id, className, fileType } = props;

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
    let reader = new FileReader();
    let file = e.target.files[0];
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
      <Field field={field} component={UploadField} onChange={_onChange} />
    </>
  );
};

const UploadField = ({ ...props }) => {
  return (
    <>
      <Field
        className="gc-file-input"
        name={`${props.field.name}.uploader`}
        type={"file"}
        {...props}
      />
    </>
  );
};

export default FileInput;
