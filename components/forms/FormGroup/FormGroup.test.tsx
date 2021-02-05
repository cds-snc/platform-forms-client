import React from "react";
import { render } from "@testing-library/react";
import { Label } from "../Label/Label";
import { TextInput } from "../TextInput/TextInput";
import { FormGroup } from "./FormGroup";
import { Formik } from "formik";

describe("FormGroup component", () => {
  const text = "Text input label";
  it("renders without errors", async () => {
    const { queryByTestId, queryByText } = render(
      <Formik
        initialValues={{
          "input-type-text": "",
        }}
        onSubmit={() => {}}
      >
        <FormGroup name="formGroup">
          <Label htmlFor="input-type-text">{text}</Label>
          <TextInput id="input-type-text" name="input-type-text" type="text" />
        </FormGroup>
      </Formik>
    );
    expect(queryByTestId("formGroup")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
