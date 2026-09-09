/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubmitButton } from "./SubmitButton";

describe("SubmitButton", () => {
  it("shows the loader while submission is in progress", () => {
    const { rerender } = render(<SubmitButton disabled={false} submissionError={false} />);
    const button = screen.getByRole("button", { name: "Submit" });

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    rerender(<SubmitButton disabled={false} submissionError={true} />);

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
