import React from "react";
import { render } from "@testing-library/react";

import { Form } from "./Form";

describe("Form component", () => {
  it("renders without errors", async () => {
    const { queryByTestId, queryByText } = render(<Form>test</Form>);
    expect(queryByTestId("form")).toBeInTheDocument();
  });
});
