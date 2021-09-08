import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { CustomPhoneInput } from "./PhoneInput";

const inputProps = {
  key: "phone",
  id: "phone",
  name: "phone number",
  label: "Phone number",
  type: "tel",
};

describe("PhoneCustom component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Formik
        onSubmit={(values) => {
          console.log(values);
        }}
        initialValues={{ id: "phone", type: "tel", name: "phone input" }}
      >
        <CustomPhoneInput {...inputProps} id={"phone"} />
      </Formik>
    );
    console.log(queryByTestId("phone"));
    //expect(queryByTestId("phone")).toBeInTheDocument();
  });
});
