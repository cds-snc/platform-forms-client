import React from "react";
import { Checkbox } from "./Checkbox";
import { Formik } from "formik";

export default {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: {
    info: `Checkbox component`,
  },
};

export const defaultCheckbox = (): React.ReactElement => (
  <Formik onSubmit={()=>{}} initialValues={{ checkbox: "" }}>
    <Checkbox id="checkbox" name="checkbox" label="My Checkbox" />
  </Formik>
);

defaultCheckbox.parameters = {
  docs: {
    source: {
      code:
        '<label class="gc-checkbox-label"><input type="checkbox" class="gc-checkbox" checked=""><span class="ml-4">Check this box</span></label>',
    },
  },
};
