import React from "react";
import { render } from "@testing-library/react";
import Form from "../Form/Form";

import { TextInput } from "./TextInput";

describe("TextInput component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Form t={(key: string) => key}>
        <TextInput id="input-type-text" name="input-type-text" type="text" />
      </Form>
    );
    expect(queryByTestId("textInput")).toBeInTheDocument();
  });
});
