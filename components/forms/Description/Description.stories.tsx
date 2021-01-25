import React from "react";
import { Description } from "./Description";

export default {
  title: "Forms/Description",
  component: Description,
  parameters: {
    info: `Description component`,
  },
};

export const defaultDescription = (): React.ReactElement => (
  <Description>This is a description</Description>
);
