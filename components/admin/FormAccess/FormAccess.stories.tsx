import { Story } from "@storybook/react";
import React from "react";
import FormAccess, { FormAccessProps } from "./FormAccess";

export default {
  title: "Admin/FormAccess",
  component: FormAccess,
  decorators: [
    (Story: React.ComponentClass<unknown>): unknown => {
      return <Story />;
    },
  ],
};

const Template: Story<FormAccessProps> = (args: FormAccessProps) => <FormAccess {...args} />;

export const defaultBearerRefresh = Template.bind({});
defaultBearerRefresh.args = {
  formID: 1,
};
