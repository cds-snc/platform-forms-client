import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Attention } from "@components/globals/Attention/Attention";

jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
    };
  },
}));

describe("Attention component", () => {
  afterEach(cleanup);

  const heading = "test heading";
  const content = "test content";

  it("renders warning without errors", () => {
    render(
      <Attention type="warning" heading={heading}>
        {content}
      </Attention>
    );

    expect(screen.queryByText("attention.warning")).toBeInTheDocument();
    expect(screen.queryByText(heading)).toBeInTheDocument();
    expect(screen.queryByText(content)).toBeInTheDocument();
  });

  it("renders warning without errors", () => {
    render(
      <Attention type="error" heading={heading}>
        {content}
      </Attention>
    );

    expect(screen.queryByText("attention.error")).toBeInTheDocument();
    expect(screen.queryByText(heading)).toBeInTheDocument();
    expect(screen.queryByText(content)).toBeInTheDocument();
  });

  it("renders without errors using some defaults", () => {
    render(<Attention>{content}</Attention>);

    expect(screen.queryByText("attention.warning")).toBeInTheDocument();
    expect(screen.queryByText(content)).toBeInTheDocument();
  });
});
