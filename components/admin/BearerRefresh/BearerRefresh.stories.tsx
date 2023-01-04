import { Story } from "@storybook/react";
import React from "react";
import BearerRefresh, { BearerRefreshProps } from "./BearerRefresh";

export default {
  title: "Admin/BearerRefresh",
  component: BearerRefresh,
  decorators: [
    (Story: React.ComponentClass<unknown>): unknown => {
      return <Story />;
    },
  ],
};

const Template: Story<BearerRefreshProps> = (args: BearerRefreshProps) => (
  <BearerRefresh {...args} />
);

export const defaultBearerRefresh = Template.bind({});
defaultBearerRefresh.args = {
  formID: "test0form00000id000asdf11",
};
