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
      logMessage.debug(values);
    }}
    initialValues={{ inputTypeText: "" }}
  >
    <TextArea
      id="inputTypeText"
      name="inputTypeText"
      characterCountMessages={{
        part1: "You have",
        part2: "characters left.",
        part1Error: "You have",
        part2Error: "characters too many.",
      }}
    />
  </Formik>
);

export const withDefaultValue = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
    initialValues={{ inputTypeText: "" }}
  >
    <TextArea
      id="inputTypeText"
      name="inputTypeText"
      defaultValue="Change me"
      characterCountMessages={{
        part1: "You have",
        part2: "characters left.",
        part1Error: "You have",
        part2Error: "characters too many.",
      }}
    />
  </Formik>
);

export const withPlaceholder = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
    initialValues={{ inputTypeText: "" }}
  >
    <TextArea
      id="inputTypeText"
      name="inputTypeText"
      placeholder="Enter value"
      characterCountMessages={{
        part1: "You have",
        part2: "characters left.",
        part1Error: "You have",
        part2Error: "characters too many.",
      }}
    />
  </Formik>
);

export const disabled = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
    initialValues={{ inputTypeText: "" }}
  >
    <TextArea
      id="inputTypeText"
      name="inputTypeText"
      disabled
      characterCountMessages={{
        part1: "You have",
        part2: "characters left.",
        part1Error: "You have",
        part2Error: "characters too many.",
      }}
    />
  </Formik>
);

export const readonly = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
    initialValues={{ inputTypeText: "" }}
  >
    <TextArea
      id="inputTypeText"
      name="inputTypeText"
      readOnly
      characterCountMessages={{
        part1: "You have",
        part2: "characters left.",
        part1Error: "You have",
        part2Error: "characters too many.",
      }}
    />
  </Formik>
);

defaultTextArea.parameters = {
  docs: {
    source: {
      code: '<label class="gc-textarea-label"><span class="ml-4">Enter text</span><textarea class="gc-textarea"></textarea></label>',
    },
  },
};
