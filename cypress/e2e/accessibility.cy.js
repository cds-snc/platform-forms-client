const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};

describe("Accessibility (A11Y) Check", () => {
  it("All components page Accessibility (A11Y) Check", () => {
    cy.mockForm("../../__fixtures__/accessibilityTestForm.json");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it("Check error state accessibility", () => {
    cy.mockForm("../../__fixtures__/cdsIntakeTestForm.json");
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });
});
