import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { TextArea } from "./TextArea";

describe("TextArea component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(

      <Formik
        initialValues={{
          "input-type-text": "",
        }}
        onSubmit={() => {}}
      >
      <TextArea id="input-type-text" name="input-type-text" />
      </Formik>
    );
    expect(queryByTestId("textarea")).toBeInTheDocument();
  });
});
