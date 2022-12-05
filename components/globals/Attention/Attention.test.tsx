import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Attention } from "@components/globals/Attention/Attention";

describe("Attention component", () => {
  afterEach(cleanup);

  const type = "warning";
  const heading = "test heading";
  const content = "test content";

  it("renders without errors", () => {
    render(
      <Attention type={type} heading={heading}>
        {content}
      </Attention>
    );

    expect(screen.queryByText("Warning")).toBeInTheDocument();
    expect(screen.queryByText(heading)).toBeInTheDocument();
    expect(screen.queryByText(content)).toBeInTheDocument();
  });

  it("renders without errors using some defaults", () => {
    render(<Attention>{content}</Attention>);

    expect(screen.queryByText("Warning")).toBeInTheDocument();
    expect(screen.queryByText(content)).toBeInTheDocument();
  });
});
