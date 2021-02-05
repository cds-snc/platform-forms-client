import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";

import { TextInput } from "./TextInput";

describe("TextInput component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Formik
        initialValues={{
          "input-type-text": "",
        }}
        onSubmit={() => {}}
      >
        <TextInput id="input-type-text" name="input-type-text" type="text" />
      </Formik>
    );
    expect(queryByTestId("textInput")).toBeInTheDocument();
  });
});
