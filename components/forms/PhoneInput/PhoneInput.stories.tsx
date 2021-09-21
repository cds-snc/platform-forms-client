import React from "react";
import { PhoneInput } from "./PhoneInput";
import { Formik } from "formik";

export default {
  title: "Forms/PhoneInput",
  component: PhoneInput,
  parameters: {
    info: `PhoneInput component`,
  },
};

const inputProps = {
  key: "1",
  id: "1",
  type: "tel",
  name: "input-type-phone",
  country: "ca",
  className: "",
  ariaDescribedBy: "description",
  placeholder: "phone",
};

export const defaultPhoneCustomComponent = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      console.log(values);
    }}
    initialValues={{ "input-type-phone": "" }}
  >
    <PhoneInput {...inputProps} />
  </Formik>
);
