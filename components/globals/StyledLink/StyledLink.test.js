import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";

describe("StyledLink component", () => {
  afterEach(cleanup);
  const linkText = "This is a link";
  const className = "testClassname";
  it("renders without errors", () => {
    render(
      <StyledLink href="http://test-href" className={className}>
        {linkText}
      </StyledLink>
    );
    screen.queryByRole("a", { href: "abc", className: className });
    expect(screen.queryByText(linkText)).toBeInTheDocument();
  });

  it("Adds aria-label attribute", () => {
    render(
      <StyledLink href="http://test-href" className={className} ariaLabel="test label">
        {linkText}
      </StyledLink>
    );
    expect(screen.getByRole("link", { name: "test label" }));
  });
});
