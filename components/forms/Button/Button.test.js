import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  test("button click", async () => {
    userEvent.setup();
    const mockOnClick = jest.fn();
    render(
      <Button type="button" onClick={mockOnClick}>
        Click Me
      </Button>
    );

    await userEvent.click(screen.getByRole("button", { name: "Click Me" }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
