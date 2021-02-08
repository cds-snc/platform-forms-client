import React from "react";
import { render } from "@testing-library/react";

import { Form } from "./Form";

describe("Form component", () => {
  it("renders without errors", async () => {
    const { queryByTestId } = render(
      <Form formObject={{ elements: null }}>test</Form>
    );
    expect(queryByTestId("form")).toBeInTheDocument();
  });
});
