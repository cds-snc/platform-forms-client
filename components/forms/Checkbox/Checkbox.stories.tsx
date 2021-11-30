import React from "react";
import { Story } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Formik } from "formik";
import { MultipleChoiceProps } from "@lib/types";
import { logMessage } from "@lib/logger";

export default {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: {
    info: `Checkbox component`,
  },
  decorators: [
    (Story: React.ComponentClass<unknown>): unknown => {
      return (
        <Formik
          onSubmit={(values) => {
            console.log(values);
          }}
          initialValues={{ a: "a" }}
        >
          <Story />
        </Formik>
      );
    },
  ],
};

const Template: Story<MultipleChoiceProps & JSX.IntrinsicElements["input"]> = (
  args: MultipleChoiceProps & JSX.IntrinsicElements["input"]
) => <Checkbox {...args} />;

export const defaultCheckbox = Template.bind({});
defaultCheckbox.args = {
  label: "My Checkbox",
};
defaultCheckbox.parameters = {
  docs: {
    source: {
      code: '<label class="gc-checkbox-label"><input type="checkbox" class="gc-checkbox" checked=""><span class="ml-4">Check this box</span></label>',
    },
  },
};
