import React from "react";
import { FileInput } from "./FileInput";
import { Formik } from "formik";
import { logMessage } from "@lib/logger";

export default {
  title: "Forms/FileInput",
  component: FileInput,
  parameters: {
    info: `FileInput component`,
  },
};

const inputProps = {
  key: "id",
  id: "fileInput",
  name: "fileInput",
  label: "Upload a PDF",
  value: "",
  fileType: ".pdf",
};

export const defaultFileInput = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
    initialValues={{ fileInput: { file: null, src: null, name: "", size: 0 } }}
  >
    <FileInput {...inputProps} />
  </Formik>
);
