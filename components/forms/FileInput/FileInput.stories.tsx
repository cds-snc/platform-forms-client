import React from "react";
import { FileInput } from "./FileInput";

export default {
  title: "Forms/FileInput",
  component: FileInput,
  parameters: {
    info: `FileInput component`,
  },
};

const inputProps = {
  key: "id",
  id: "id",
  name: "pdf",
  label: "Upload a PDF",
  value: "",
  fileType: ".pdf",
};

export const defaultFileInput = (): React.ReactElement => (
  <FileInput {...inputProps} />
);
