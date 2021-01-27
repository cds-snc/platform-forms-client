import React from "react";
import { TextInput } from "./TextInput";

export default {
  title: "Forms/TextInput",
  component: TextInput,
  parameters: {
    info: `TextInput component`,
  },
};

export const defaultTextInput = (): React.ReactElement => (
  <TextInput id="input-type-text" name="input-type-text" type="text" />
);

defaultTextInput.parameters = {
  docs: {
    source: {
      code:
        '<label class="gc-input-label">Text Input<input type="text" name="" class="gc-input-text"></label>',
    },
  },
};
