import React from "react";
import { Checkbox } from "./Checkbox";

export default {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: {
    info: `Checkbox component`,
  },
};

export const defaultCheckbox = (): React.ReactElement => (
  <Checkbox id="checkbox" name="checkbox" label="My Checkbox" />
);

defaultCheckbox.parameters = {
  docs: {
    source: {
      code:
        '<label class="gc-checkbox-label"><input type="checkbox" class="gc-checkbox" checked=""><span class="ml-4">Check this box</span></label>',
    },
  },
};
