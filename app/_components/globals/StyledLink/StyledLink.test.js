import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { StyledLink } from "@appComponents/globals/StyledLink/StyledLink";

describe("StyledLink component", () => {
  afterEach(cleanup);
  const linkText = "This is a link";
  const className = "testClassname";
  const labelText = "This is a label";

  it("renders without errors", () => {
    render(<StyledLink href="http://test-href">{linkText}</StyledLink>);
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
  });

  it("Shold not have a class", () => {
    render(<StyledLink href="http://test-href">{linkText}</StyledLink>);
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
    expect(anchor).not.toHaveClass(className);
  });

  it("Shold have a class", () => {
    render(
      <StyledLink href="http://test-href" className={className}>
        {linkText}
      </StyledLink>
    );
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveClass(className);
  });

  it("Should not have aria-label attribute", () => {
    render(<StyledLink href="http://test-href">{linkText}</StyledLink>);
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
    expect(anchor).not.toHaveAttribute("aria-label");
  });

  it("Should have aria-label attribute", () => {
    render(
      <StyledLink href="http://test-href" ariaLabel={labelText}>
        {linkText}
      </StyledLink>
    );
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute("aria-label", labelText);
  });

  it("Should not have lang attribute", () => {
    render(<StyledLink href="http://test-href">{linkText}</StyledLink>);
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
    expect(anchor).not.toHaveAttribute("lang");
  });

  it("Should have lang attribute", () => {
    render(
      <StyledLink href="http://test-href" lang="fr">
        {linkText}
      </StyledLink>
    );
    const anchor = screen.getByRole("link");
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute("lang", "fr");
  });
});
