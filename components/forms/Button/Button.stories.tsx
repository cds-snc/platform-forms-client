import React from "react";
import { Button } from "@components/forms";

export default {
  title: "Forms/Button",
  component: Button,
};

export const defaultButton = (): React.ReactElement => <Button type="button">Click Me</Button>;

export const secondaryButton = (): React.ReactElement => (
  <Button type="button" secondary={true}>
    Click Me
  </Button>
);

export const destructiveButton = (): React.ReactElement => (
  <Button type="button" destructive={true}>
    Delete
  </Button>
);

defaultButton.parameters = {
  docs: {
    source: {
      code: '<button type="button" class="gc-button button">Next</button>',
    },
  },
};
