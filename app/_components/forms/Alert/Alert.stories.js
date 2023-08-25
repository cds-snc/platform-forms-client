import React from "react";
import { Alert } from "./Alert";

import { Button } from "@appComponents/forms";

export default {
  title: "Forms/Alert",
  component: Alert,
};

const Template = (args) => <Alert language="en" t={(key) => key} {...args} />;
const testText = (
  <>
    Lorem ipsum dolor sit amet, <a href="#test">consectetur adipiscing</a> elit, sed do eiusmod.
  </>
);

export const success = Template.bind({});

success.args = {
  type: "success",
  heading: "Success status",
  children: testText,
};

export const warning = Template.bind({});
warning.args = {
  type: "warning",
  heading: "Warning status",
  children: testText,
};

export const error = Template.bind({});
error.args = {
  type: "error",
  heading: "Error status",
  children: testText,
};

export const info = Template.bind({});
info.args = {
  type: "info",
  heading: "Info status",
  children: testText,
};

export const withCTA = Template.bind({});
withCTA.args = {
  type: "error",
  heading: "Error with CTA",
  children: testText,
  cta: <Button type="button">Click here</Button>,
};

export const dismissible = Template.bind({});
dismissible.args = {
  type: "success",
  heading: "Dismissible Alert",
  children: testText,
  dismissible: true,
};
