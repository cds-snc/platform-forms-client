import React from "react";
import { ErrorMessage, ErrorMessageProps } from "./ErrorMessage";
import { Story } from "@storybook/react";

export default {
  title: "Forms/ErrorMessage",
  component: ErrorMessage,
};

const Template: Story<ErrorMessageProps> = (args: ErrorMessageProps) => (
  <ErrorMessage {...args}>{args.children}</ErrorMessage>
);

export const DefaultErrorMessage = Template.bind({});
DefaultErrorMessage.args = {
  id: "errorMessageId",
  children: "Helpful error message.",
};
