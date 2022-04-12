import React from "react";
import { TextInput } from "./TextInput";
import { Formik } from "formik";
import { logMessage } from "@lib/logger";

export default {
  title: "Forms/TextInput",
  component: TextInput,
  parameters: {
    info: `TextInput component`,
  },
};

export const defaultTextInput = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
    initialValues={{ inputTypeText: "" }}
  >
    <TextInput
      id="inputTypeText"
      name="inputTypeText"
      type="text"
      characterCountMessages={{
        part1: "You have",
        part2: "characters left.",
        part1Error: "You have",
        part2Error: "characters too many.",
      }}
    />
  </Formik>
);

defaultTextInput.parameters = {
  docs: {
    source: {
      code: '<label class="gc-input-label">Text Input<input type="text" name="" class="gc-input-text"></label>',
    },
  },
};
