import React from "react";
import { render } from "@testing-library/react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders without errors", () => {
    const { queryByTestId } = render(<Button type="button">Click Me</Button>);
    expect(queryByTestId("button")).toBeInTheDocument();
  });

  describe("renders correct className", () => {
    it("gc-button", () => {
      const { queryByTestId } = render(<Button type="button">Click Me</Button>);
      expect(queryByTestId("button")).toHaveClass("gc-button");
    });
  });

  describe("renders secondary button", () => {
    it("gc-button", () => {
      const { queryByTestId } = render(
        <Button type="button" secondary={true}>
          Click Me
        </Button>
      );
      expect(queryByTestId("button")).toHaveClass("gc-button--secondary");
    });
  });
});
