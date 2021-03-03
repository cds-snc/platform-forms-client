import React from "react";
import { render } from "@testing-library/react";
import Form from "../Form/Form";
import { Checkbox } from "./Checkbox";

describe("Checkbox component", () => {
  it("renders without errors", async () => {
    const { queryByTestId, queryByLabelText } = render(
      <Form t={(key: string) => key}>
        <Checkbox id="input-checkbox" name="input-checkbox" label="My checkbox" />
      </Form>
    );
    expect(queryByTestId("checkbox")).toBeInTheDocument();
    expect(queryByLabelText("My checkbox")).toBeInTheDocument();
  });
});
