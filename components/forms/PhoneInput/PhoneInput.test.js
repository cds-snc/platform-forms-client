import React from "react";
import { queryByText, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { CustomPhoneInput } from "./PhoneInput";

const inputProps = {
  key: "phone",
  id: "phone",
  name: "phone number",
  label: "Phone number",
  type:"tel"
};

describe("PhoneCustom component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Formik
        onSubmit={(values) => {
          console.log(values);
        }}
        initialValues={{}}
      >
        <CustomPhoneInput {...inputProps}/>
      </Formik>
    );
    console.log(queryByTestId("phone"));
    //expect(queryByTestId("phone")).toBeInTheDocument();
  });
});
