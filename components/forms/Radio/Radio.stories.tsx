import React from "react";
import { Radio } from "./Radio";
import { Formik } from "formik";

export default {
  title: "Forms/Radio",
  component: Radio,
  parameters: {
    info: `Radio component`,
  },
};

export const defaultRadio = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      console.log(values);
    }}
    initialValues={{ "input-radio": "" }}
  >
    <Radio id="input-radio" name="input-radio" label="My Radio Button" />
  </Formik>
);

export const selected = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      console.log(values);
    }}
    initialValues={{ "input-radio": "" }}
  >
    <Radio id="input-radio" name="input-radio" label="My Radio Button" defaultChecked />
  </Formik>
);

export const disabled = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      console.log(values);
    }}
    initialValues={{ "input-radio": "" }}
  >
    <Radio id="input-radio" name="input-radio" label="My Radio Button" disabled />
  </Formik>
);
