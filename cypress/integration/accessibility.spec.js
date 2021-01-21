const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};
context("Accessibility (A11Y)", () => {
  it("Passes accessibility tests", () => {
    cy.visit("http://localhost:3000");
    cy.injectAxe();
    cy.checkA11y(A11Y_OPTIONS);
  });
});
