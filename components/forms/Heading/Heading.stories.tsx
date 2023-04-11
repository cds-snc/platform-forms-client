import React from "react";
import { Heading } from "./Heading";

export default {
  title: "Forms/Heading",
  component: Heading,
  parameters: {
    info: `Heading component`,
  },
};

export const defaultH1 = (): React.ReactElement => (
  <Heading headingLevel="h1">This is a main page heading</Heading>
);

export const sectionHeading = (): React.ReactElement => (
  <Heading headingLevel="h2" isSectional={true}>
    This is a section heading
  </Heading>
);

export const H3 = (): React.ReactElement => (
  <Heading headingLevel="h3">This is an H3 page heading</Heading>
);

export const H4 = (): React.ReactElement => (
  <Heading headingLevel="h4">This is an H4 heading</Heading>
);
