import React from "react";
import { Story } from "@storybook/react";
import { Description, DescriptionProps } from "./Description";

export default {
  title: "Forms/Description",
  component: Description,
  parameters: {
    info: `Description component`,
  },
};

const Template: Story<DescriptionProps> = (args: DescriptionProps) => (
  <Description {...args}>{args.children}</Description>
);

export const defaultDescription = Template.bind({});
defaultDescription.args = {
  children: "This is a description",
};
