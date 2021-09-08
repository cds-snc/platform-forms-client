import React from "react";
import { CustomPhoneInput } from "./PhoneInput";
import { Formik } from "formik";

export default {
  title: "Forms/PhoneInput",
  component: CustomPhoneInput,
  parameters: {
    info: `PhoneInput component`,
  },
};

const inputProps = {
  key: "input-type-phone",
  id: "input-type-phone",
  type: "tel",
  name: "input-type-phone",
  country: "ca",
  className: "",
  ariaDescribedBy: "Phone Number",
  placeholder: "phone",
};

export const defaultPhoneCustomComponent = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      console.log(values);
    }}
    initialValues={{ "input-type-phone": "" }}
  >
    <CustomPhoneInput {...inputProps} />
  </Formik>
);