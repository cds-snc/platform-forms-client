import React from "react";
import { render } from "@testing-library/react";
import { Label } from "../Label/Label";
import { TextInput } from "../TextInput/TextInput";
import { FormGroup } from "./FormGroup";
import Form from "../Form/Form";

describe("FormGroup component", () => {
  const text = "Text input label";
  it("renders without errors", async () => {
    const { queryByTestId, queryByText } = render(
      <Form t={(key: string) => key}>
        <FormGroup name="formGroup">
          <Label htmlFor="input-type-text">{text}</Label>
          <TextInput id="input-type-text" name="input-type-text" type="text" />
        </FormGroup>
      </Form>
    );
    expect(queryByTestId("formGroup")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});
