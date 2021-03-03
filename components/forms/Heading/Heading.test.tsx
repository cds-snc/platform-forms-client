import React from "react";
import { render } from "@testing-library/react";

import { Heading } from "./Heading";

describe("Heading component", () => {
  const text = "This is a heading";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(<Heading headingLevel="h2">{text}</Heading>);
    expect(queryByTestId("heading")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });

  it("renders secondary heading", () => {
    const { queryByTestId } = render(
      <Heading headingLevel="h2" isSectional={true}>
        {text}
      </Heading>
    );
    expect(queryByTestId("heading")).toHaveClass("gc-section-header");
  });
});
