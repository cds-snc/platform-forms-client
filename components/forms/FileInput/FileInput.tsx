import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface FileInputProps {
  id: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  fileType?: string | undefined;
}

export const FileInput = (props: FileInputProps): React.ReactElement => {
  const { id, className, fileType } = props;

  const classes = classnames("gc-file-input", className);
  const [field, meta] = useField(props);

  return (
    <input
      type="file"
      data-testid="file"
      className={classes}
      id={id}
      accept={fileType}
      {...field}
    />
  );
};

export default FileInput;
