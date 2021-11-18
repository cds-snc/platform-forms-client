import React from "react";
import { TextArea } from "./TextArea";
import { Formik } from "formik";
import { logMessage } from "@lib/logger";

export default {
  title: "Forms/TextArea",
  component: TextArea,
  parameters: {
    info: `TextArea component`,
  },
};

export const defaultTextArea = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <TextArea id="input-type-text" name="input-type-text" />
  </Formik>
);

export const withDefaultValue = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <TextArea id="input-type-text" name="input-type-text" defaultValue="Change me" />
  </Formik>
);

export const withPlaceholder = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <TextArea id="input-type-text" name="input-type-text" placeholder="Enter value" />
  </Formik>
);

export const disabled = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <TextArea id="input-type-text" name="input-type-text" disabled />
  </Formik>
);

export const readonly = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <TextArea id="input-type-text" name="input-type-text" readOnly />
  </Formik>
);

defaultTextArea.parameters = {
  docs: {
    source: {
      code: '<label class="gc-textarea-label"><span class="ml-4">Enter text</span><textarea class="gc-textarea"></textarea></label>',
    },
  },
};
