import React from "react";
import { Button } from "./Button";

export default {
  title: "Forms/Button",
  component: Button,
  parameters: {
    info: `
USWDS 2.0 Button component

Source: https://designsystem.digital.gov/components/button/
`,
  },
};

export const defaultButton = (): React.ReactElement => (
  <Button type="button">Click Me</Button>
);

defaultButton.parameters = {
  docs: {
    source: {
      code: '<button type="button" class="gc-button button">Next</button>',
    },
  },
};
