import React from "react";
import { Label } from "./Label";

export default {
  title: "Forms/Label",
  component: Label,
  parameters: {
    info: `Label component`,
  },
};

export const defaultLabel = (): React.ReactElement => (
  <Label htmlFor="testInput">Text input label</Label>
);

defaultLabel.parameters = {
  docs: {
    source: {
      code: '<label class="gc-input-label">Text Input<input type="text" name="" class="gc-input-text"></label>',
    },
  },
};
