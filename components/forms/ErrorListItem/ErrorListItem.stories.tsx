import React from "react";
import { ErrorListItem, ErrorListProps } from "./ErrorListItem";
import { Alert } from "../Alert/Alert";
import { Story } from "@storybook/react";

export default {
  title: "Forms/ErrorListItem",
  component: ErrorListItem,
  decorators: [
    (Story: React.ComponentClass<unknown>): unknown => {
      return (
        <Alert
          type="error"
          heading="Please correct the errors on the page"
          validation={true}
          id="1234"
          tabIndex={0}
        >
          <ol className="gc-ordered-list">
            <Story />
          </ol>
        </Alert>
      );
    },
  ],
};

const Template: Story<ErrorListProps> = (args: ErrorListProps) => <ErrorListItem {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  errorKey: "1.0",
  value: "First error message",
};
