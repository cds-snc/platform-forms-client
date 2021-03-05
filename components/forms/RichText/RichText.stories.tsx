import React from "react";
import { RichText } from "./RichText";

export default {
  title: "Forms/RichText",
  component: RichText,
  parameters: {
    info: `RichText component`,
  },
};

export const defaultRichText = (): React.ReactElement => <RichText>This is a RichText</RichText>;
