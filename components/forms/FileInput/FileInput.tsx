import React from "react";
import classnames from "classnames";

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

  return (
    <input
      type="file"
      data-testid="file"
      className={classes}
      id={id}
      name={id}
      accept={fileType}
    />
  );
};

export default FileInput;
