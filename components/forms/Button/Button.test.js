import React from "react";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button component", () => {
  afterEach(cleanup);
  test("renders without errors", () => {
    render(<Button type="button">Click Me</Button>);
    expect(screen.queryByTestId("button")).toBeInTheDocument();
  });

  describe("renders correct className", () => {
    test("gc-button", () => {
      render(<Button type="button">Click Me</Button>);
      expect(screen.queryByTestId("button")).toHaveClass("gc-button");
    });
  });

  describe("renders secondary button", () => {
    test("gc-button", () => {
      render(
        <Button type="button" secondary={true}>
          Click Me
        </Button>
      );
      expect(screen.queryByTestId("button")).toHaveClass("gc-button--secondary");
    });
  });
  test("button click", () => {
    const mockOnClick = jest.fn();
    render(
      <Button type="button" onClick={mockOnClick}>
        Click Me
      </Button>
    );
    fireEvent.click(screen.getByRole("button", { name: "Click Me" }));
    expect(mockOnClick).toHaveBeenCalled().toHaveBeenCalledTimes(1);
  });
});
