import React from "react";
import { cleanup, render, screen } from "@testing-library/react";

import { Heading } from "./Heading";

describe("Heading component", () => {
  afterEach(cleanup);
  const text = "This is a heading";
  test("renders without errors", () => {
    render(<Heading headingLevel="h2">{text}</Heading>);
    expect(screen.queryByTestId("heading")).toBeInTheDocument();
    expect(screen.queryByText(text)).toBeInTheDocument();
  });

  test("renders secondary heading", () => {
    const { queryByTestId } = render(
      <Heading headingLevel="h2" isSectional={true}>
        {text}
      </Heading>
    );
    expect(queryByTestId("heading")).toHaveClass("gc-section-header");
  });
});
