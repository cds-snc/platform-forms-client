/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubmitButton } from "./SubmitButton";

describe("SubmitButton", () => {
  it("shows the loader while submission is in progress", () => {
    const { rerender } = render(
      <SubmitButton disabled={false} isSubmitting={true} submissionError={false} />
    );
    const button = screen.getByRole("button", { name: /Submit/ });

    expect(button).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    rerender(<SubmitButton disabled={false} isSubmitting={false} submissionError={false} />);

    expect(button).toBeEnabled();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("removes the loader after a submission error so the button can be retried", () => {
    const { rerender } = render(
      <SubmitButton disabled={false} isSubmitting={true} submissionError={false} />
    );
    const button = screen.getByRole("button", { name: /Submit/ });

    expect(button).toBeDisabled();
    rerender(<SubmitButton disabled={false} isSubmitting={false} submissionError={true} />);

    expect(button).toBeEnabled();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
