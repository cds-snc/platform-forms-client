import React from "react";
import { Formik } from "formik";
import { Dropdown } from "./Dropdown";
import { logMessage } from "@lib/logger";

export default {
  title: "Forms/Dropdown",
  component: Dropdown,
  parameters: {
    info: `Dropdown component`,
  },
};

const choices = [
  "",
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

export const defaultDropdown = (): React.ReactElement => (
  <Formik
    initialValues={{ dropdown: "" }}
    onSubmit={(values) => {
      logMessage.debug(values);
    }}
  >
    <Dropdown id="dropdown" name="dropdown" choices={choices} />
  </Formik>
);

defaultDropdown.parameters = {
  docs: {
    source: {
      code: '<select class="gc-dropdown" name="support_type"><option value="GC Form - First option">GC Form - First option</option><option value="GC Form - Second option">GC Form - Second option</option></select>',
    },
  },
};
