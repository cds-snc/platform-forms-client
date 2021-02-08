import React from "react";
import { render } from "@testing-library/react";
import Form from "../Form/Form";
import { TextArea } from "./TextArea";

describe("TextArea component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Form>
        <TextArea id="input-type-text" name="input-type-text" />
      </Form>
    );
    expect(queryByTestId("textarea")).toBeInTheDocument();
  });
});
